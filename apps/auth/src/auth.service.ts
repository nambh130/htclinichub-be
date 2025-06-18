import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientRepository } from './patients/patients.repository';
import { Patient } from './patients/models/patient.entity';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { RpcException } from '@nestjs/microservices';
import { InvitationsService } from './invitations/invitations.service';
import { InvitationSignupDto } from './dto/invitation-signup.dto';
import { ClinicUsersService } from './clinic-users/clinic-users.service';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import * as bcrypt from 'bcrypt'
import { ActorEnum } from './clinic-users/models/clinic-user.entity';
import { InvitationEnum } from './invitations/models/invitation.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly patientRepository: PatientRepository,
    private readonly invitationService: InvitationsService,
    private readonly clinicUserService: ClinicUsersService
  ) { }

  // ------------------------------ PATIENT ---------------------------------
  async patientLogin(phone: string) {
    try {
      var patient = await this.patientRepository.findOne({ phone }, {});
    } catch (error) {
      // Create a new patient account if the patient is not found
      const newPatient = new Patient({ phone });
      patient = await this.patientRepository.create(newPatient);
    }
    const tokenPayload: TokenPayload = {
      userId: patient.id.toString(),
      actorType: ActorEnum.PATIENT
    }
    const expires = new Date();
    const jwtExpiration = Number(
      this.configService.get('JWT_EXPIRES_IN') ?? 3600,
    );
    expires.setSeconds(expires.getSeconds() + jwtExpiration);
    const token = await this.jwtService.signAsync(tokenPayload);

    return { user: patient, token };
  } catch(error: unknown) {
    if (error instanceof Error) {
      throw new RpcException({
        message: error.message,
        type: error.name,
        stack: error.stack,
      });
    }

    throw new RpcException({
      message: 'Unknown error',
      type: 'UnknownError',
    });
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }

  // ------------------------------ EMPLOYEE ---------------------------------
  // Doctor without an account create an account with an invitation
  async invitationSignup(invitationSignupDto: InvitationSignupDto) {
    const { token, email, password } = invitationSignupDto;
    const invitation = await this.invitationService.getInvitationByToken({ token, email });
    // Check if the token is still valid
    if (invitation.status != "pending") {
      throw new BadRequestException("Invitation is invalid or expired!");
    }

    // Check if the email provided and the email in the invitation matches
    if (email != invitation.email) {
      throw new BadRequestException("Invitation is invalid or expired!");
    }
    const clinicUser = {
      email,
      password,
      actorType: invitation.actorType,
      role: invitation.role.id,
      clinic: invitation.clinic.id
    };
    const newClinicUser = await this.clinicUserService.createUser(clinicUser);

    // If new user has been created, update the status of the invitation
    if (newClinicUser) {
      this.invitationService.updateInvitationStatus(invitation.id, InvitationEnum.ACCEPTED);
    }

    return newClinicUser;
  }

  async clinicUserLogin(dto: ClinicUserLoginDto) {
    const user = await this.clinicUserService.findUserByEmail(dto.email);

    if (!user) throw new BadRequestException("User not found");
    const isMatch = await bcrypt.compare(dto.password, user.password);


    if (isMatch) {
      const tokenPayload: TokenPayload = {
        userId: user.id,
        actorType: user.actorType as ActorEnum,
      }

      // Create an array of permissions from roles
      const permissions = Array.from(
        new Set( // Use set to ensure uniqueness of permissions in the token
          user.roles.flatMap((role) => role.permissions.map((p) => p.name)) // or p.id
        )
      );
      tokenPayload.permissions = permissions;

      const roles = user.roles.map((role) => role.name);
      tokenPayload.roles = roles;

      // Get all clinics that this user is currently working at
      const currentClinics = user.currentClinics;
      tokenPayload.currentClinics = currentClinics.map((clinic) => clinic.id);

      const adminOf = user.clinics;
      tokenPayload.adminOf = adminOf.map((clinic) => clinic.id);

      const token = await this.createJWT(tokenPayload);

      return { user: user.id, token };
    }
  }

  async createJWT(payload: TokenPayload) {
    const expires = new Date();
    const jwtExpiration = Number(
      this.configService.get('JWT_EXPIRES_IN') ?? 3600,
    );
    expires.setSeconds(expires.getSeconds() + jwtExpiration);
    const token = await this.jwtService.signAsync(payload);
    return token
  }
}
