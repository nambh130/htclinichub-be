import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientRepository } from './patients/patients.repository';
import { Patient } from './patients/models/patient.entity';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { ClientKafka } from '@nestjs/microservices';
import { InvitationsService } from './invitations/invitations.service';
import { InvitationSignupDto } from './dto/invitation-signup.dto';
import { ClinicUsersService } from './clinic-users/clinic-users.service';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import * as bcrypt from 'bcrypt';
import { ActorEnum } from './clinic-users/models/clinic-user.entity';
import { InvitationEnum } from './invitations/models/invitation.entity';
import { ClinicRepository } from './clinics/clinics.repository';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { AUTH_SERVICE } from '@app/common';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { ClinicOwnerAdded } from '@app/common/events/auth/clinic-owner-added.event';
import { PatientCreated } from '@app/common/events/auth/patient-created.event';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly patientRepository: PatientRepository,
    private readonly invitationService: InvitationsService,
    private readonly clinicUserService: ClinicUsersService,
    private readonly clinicRepository: ClinicRepository,
    @Inject(AUTH_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {}

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
    const token = await this.jwtService.signAsync(tokenPayload);

    return { user: patient, token };
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
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

  async clinicUserLogin(dto: ClinicUserLoginDto) {
    const { email, userType } = dto;
    const user = await this.clinicUserService.find({
      email,
      actorType: userType,
    });
    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid credentials');

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      actorType: user.actorType as ActorEnum,
      permissions: Array.from(
        new Set(
          user.roles.flatMap((role) => role.permissions.map((p) => p.name)),
        ),
      ),
      roles: user.roles.map((r) => r.name),
    };

    const currentClinics = user.clinics;
    tokenPayload.currentClinics = currentClinics.map((clinic) => clinic.id);

    const adminOf = user.ownerOf.map((clinic) => clinic.id);
    tokenPayload.isAdminOf = adminOf;
    //if (user.clinics && user.clinics.length > 0) {
    //  const currentClinic = user.clinics[0];
    //  if (currentClinic) {
    //    tokenPayload.currentClinic = currentClinic.id;
    //    if (currentClinic.owner?.id === user.id) {
    //      tokenPayload.isAdmin = true;
    //    }
    //  }
    //}

    const token = await this.createJWT(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        roles: tokenPayload.roles,
        currentClinics: tokenPayload.currentClinics,
        adminOf,
      },
      token,
    };
  }

  async createJWT(payload: TokenPayload) {
    const expires = new Date();
    const jwtExpiration = Number(
      this.configService.get('JWT_EXPIRES_IN') ?? 3600,
    );
    expires.setSeconds(expires.getSeconds() + jwtExpiration);
    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
