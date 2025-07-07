import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientRepository } from './patients/patients.repository';
import { Patient } from './patients/models/patient.entity';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { InvitationsService } from './invitations/invitations.service';
import { InvitationSignupDto } from './dto/invitation-signup.dto';
import { ClinicUsersService } from './clinic-users/clinic-users.service';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import * as bcrypt from 'bcrypt';
import { ActorEnum, User } from './clinic-users/models/clinic-user.entity';
import { InvitationEnum } from './invitations/models/invitation.entity';
import { ClinicRepository } from './clinics/clinics.repository';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { AUTH_SERVICE, TokenPayload } from '@app/common';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { ClinicOwnerAdded } from '@app/common/events/auth/clinic-owner-added.event';
import { PatientCreated } from '@app/common/events/auth/patient-created.event';
import { RefreshTokenRepository } from './refresh-token/refresh-token.repository';
import { RefreshToken } from './refresh-token/models/refresh-token.model';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import AuthResponse from '@app/common/dto/auth/login-response.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly patientRepository: PatientRepository,
    private readonly invitationService: InvitationsService,
    private readonly clinicUserService: ClinicUsersService,
    private readonly clinicRepository: ClinicRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @Inject(AUTH_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  // ------------------------------ PATIENT ---------------------------------
  async patientLogin(phone: string) {
    try {
      var patient = await this.patientRepository.findOne({ phone }, {});
    } catch (error) {
      // Create a new patient account if the patient is not found
      const newPatient = new Patient({ phone });
      patient = await this.patientRepository.create(newPatient);
      if (patient) {
        // Emit an event that a new patient is added
        const patientSignupEvent = new PatientCreated(patient);
        this.kafkaClient.emit('patient-created', patientSignupEvent.toString());
      }
    }
    const tokenPayload: TokenPayload = {
      userId: patient.id.toString(),
      actorType: ActorEnum.PATIENT,
    };
    const expires = new Date();
    const jwtExpiration = Number(
      this.configService.get('JWT_EXPIRES_IN') ?? 3600,
    );
    expires.setSeconds(expires.getSeconds() + jwtExpiration);
    const token = await this.jwtService.signAsync(tokenPayload, { expiresIn: 60 * 60 * 24 });

    return { user: patient, token };
  }

  // ------------------------------ EMPLOYEE ---------------------------------
  // Doctor without an account create an account with an invitation
  async invitationSignup(invitationSignupDto: InvitationSignupDto) {
    const { token, email, password } = invitationSignupDto;
    const invitation = await this.invitationService.getInvitationByToken({
      token,
      email,
    });

    if (invitation.status !== 'pending' || email !== invitation.email) {
      throw new BadRequestException('Invitation is invalid or expired!');
    }

    const clinicUser = {
      email,
      password,
      actorType: invitation.role.roleType,
      role: invitation.role.id,
      clinic: invitation.clinic.id,
    };

    const newClinicUser = await this.clinicUserService.createUser(clinicUser);

    // If the user is the owner, update clinic
    if (invitation.isOwnerInvitation) {
      await this.clinicRepository.findOneAndUpdate(
        { id: invitation.clinic.id },
        { owner: newClinicUser },
      );
    }

    // Emit `clinic-user-created` event
    this.kafkaClient
      .emit(
        'clinic-user-created',
        new ClinicUserCreated({
          id: newClinicUser.id,
          email: newClinicUser.email,
          actorType: newClinicUser.actorType,
          clinicId: invitation.clinic.id,
          ownerOf: invitation.isOwnerInvitation
            ? invitation.clinic.id
            : undefined,
        }),
      )
      .subscribe({
        error: (err) => {
          console.error('Failed to emit event:', err);
        },
      });

    // Update invitation status
    await this.invitationService.updateInvitationStatus(
      invitation.id,
      InvitationEnum.ACCEPTED,
    );

    return newClinicUser;
  }

  async acceptInvitation(
    userId: string,
    acceptInvitationDto: AcceptInvitationDto,
  ) {
    const { token, accept } = acceptInvitationDto;

    // find doctor user  validation
    // because only doctor can be invited to multiple clinics
    const user = await this.clinicUserService.find({
      id: userId,
      actorType: ActorEnum.DOCTOR,
    });
    const email = user.email;

    // getInvitationByToken() automatically check and update invitation status
    // if it is expired
    const invitation = await this.invitationService.getInvitationByToken({
      token,
      email,
    });

    // Check if the invitation has expired
    if (invitation.status != 'pending') {
      throw new BadRequestException('Invitation is invalid or expired!');
    }
    if (!accept) {
      //User reject the token
      await this.invitationService.updateInvitationStatus(
        invitation.id,
        InvitationEnum.REVOKED,
      );
      return { message: 'Invitation rejected' };
    }

    // Check if the user from token is the same as the user from the invitation
    if (
      !user ||
      invitation.email != email //Check if the user from jwt and the invted user is the same
    ) {
      throw new BadRequestException('Invalid invitation');
    }

    // Check the user has already in the invted clinic
    const clinicToAdd = invitation.clinic;
    const alreadyExists = user.clinics.some((c) => c.id === clinicToAdd.id);

    if (!alreadyExists) {
      user.clinics.push(clinicToAdd);
      const joinResult = await this.clinicUserService.updateUser(user.id, user);

      if (joinResult) {
        // Emit user-clinic-joined event
        this.kafkaClient.emit('user-clinic-joined', {
          userId: user.id,
          clinicId: clinicToAdd.id,
        });
      }
    }

    if (invitation.isOwnerInvitation) {
      await this.clinicRepository.findOneAndUpdate(
        { id: invitation.clinic.id },
        { owner: user },
      );

      // Emit clinic-owner-assigned event
      this.kafkaClient.emit(
        'clinic-owner-added',
        new ClinicOwnerAdded({
          clinicId: invitation.clinic.id,
          ownerId: user.id,
        }),
      );
    }

    await this.invitationService.updateInvitationStatus(
      invitation.id,
      'accepted',
    );

    return { message: 'Invitation accepted', user };
  }

  async userLogin(dto: ClinicUserLoginDto, userAgent?: string, ip?: string)
    : Promise<AuthResponse & { refreshToken: string }> {
    const { email, userType } = dto;
    const user = await this.clinicUserService.find({
      email: email.toLowerCase().trim(),
      actorType: userType,
    });
    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid credentials');

    const tokenPayload = this.buildTokenPayload(user);
    const token = await this.createJWT(tokenPayload);

    const refreshToken = await this.createRefreshToken(user.id, userAgent, ip);

    return {
      user: {
        id: user.id,
        email: user.email,
        actorType: userType,
        roles: tokenPayload.roles ?? [],
        currentClinics: tokenPayload.currentClinics ?? [],
        adminOf: tokenPayload.adminOf ?? [],
      },
      token,
      refreshToken,
    };
  }

  // ------------------------------ UTILITIES ---------------------------------
  async createJWT(payload: TokenPayload) {
    const jwtExpirationMin = Number(this.configService.get<number>('JWT_EXPIRES_IN') || 15);

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: jwtExpirationMin * 60,
    });

    return token;
  }

  async createRefreshToken(userId: string, userAgent?: string, ip?: string): Promise<string> {
    try {
      const expireDate = this.configService.get("REFRESH_TOKEN_EXPIRES");

      const selector = randomBytes(16).toString('hex'); // used to look up the token
      const verifier = randomBytes(64).toString('hex'); // will be hashed and stored
      const token = `${selector}.${verifier}`; // send this to the client
      const hashedVerifier = await argon2.hash(verifier);

      try {
        this.refreshTokenRepo.create(new RefreshToken({
          userId: userId,
          userAgent,
          ipAddress: ip,
          tokenHash: hashedVerifier,
          selector,
          expiresAt: new Date(Date.now() + expireDate)// 7 days
        }));
      } catch (error) {
        throw new Error("Failed to create refresh token");
      }

      return token
    } catch (error) {
      throw new Error(error);
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshToken> {
    const [selector, verifier] = token.split('.') ?? [];

    const record = await this.refreshTokenRepo.findOne({ selector });
    if (!record) throw new UnauthorizedException("Token not found");

    const isValid = await argon2.verify(record.tokenHash, verifier);
    if (!isValid || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Token expired or invalid!");
    }

    return record;
  }

  buildTokenPayload(user: User): TokenPayload {
    const currentClinics = user.clinics.map((clinic) => clinic.id);
    const adminOf = user.ownerOf.map((clinic) => clinic.id);
    const permissions = Array.from(
      new Set(user.roles.flatMap((role) => role.permissions.map((p) => p.name)))
    );

    return {
      userId: user.id,
      email: user.email,
      actorType: user.actorType as ActorEnum,
      roles: user.roles.map((r) => r.name),
      permissions,
      currentClinics,
      adminOf: adminOf,
    };
  }

  async invalidateRefreshToken(token: string): Promise<void> {
    const [selector] = token.split('.');

    if (!selector) {
      throw new BadRequestException('Invalid refresh token format');
    }

    await this.refreshTokenRepo.delete({ selector });
  }
}
