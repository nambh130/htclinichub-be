import { BaseService } from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InvitationRepository } from './invitation.repository';
import { CreateInvitationDto } from './dto/create-invitaion.dto';
import { createHash, randomBytes } from 'crypto';
import { EmployeeInvitation, InvitationType } from './models/invitation.entity';
import { Clinic } from '../clinics/models/clinic.entity';
import { Role, RoleEnum } from '../roles/models/role.entity';
import { RoleRepository } from '../roles/roles.repository';
import { ClinicUsersService } from '../clinic-users/clinic-users.service';
import { ActorEnum } from '../clinic-users/models/clinic-user.entity';
import { ClinicUserRepository } from '../clinic-users/clinic-users.repository';

@Injectable()
export class InvitationsService extends BaseService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: ClinicUserRepository,
  ) { super() }

  async createInvitation(createInvitationDto: CreateInvitationDto) {
    const { email, clinic, role, userType, isOwnerInvitation } = createInvitationDto;
    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days in ms

    // Check if user exist because you can't invite employee account into multiple clinics
    // But doctor account can be invited to multiple clinics
    if (userType == ActorEnum.EMPLOYEE) {
      var checkEmployee: any;
      try {
        checkEmployee = await this.userRepository.findOne({ email, actorType: userType });
      } catch (error) {
        checkEmployee = null
      }
      if (checkEmployee) {
        throw new BadRequestException("Account already exists!");
      }
    }
    if (isOwnerInvitation && userType != ActorEnum.DOCTOR) {
      throw new BadRequestException("Only doctor account can be owner!");
    }

    // Create new Invitation object
    const newInvitation = new EmployeeInvitation({
      email,
      actorType: userType,
      isOwnerInvitation,
      expires_at: expiresAt,
      role: { id: role } as Role,
      clinic: { id: clinic } as Clinic,
      hashedToken
    });

    // Save to database
    return {
      token: token,
      invitation: await this.invitationRepository.create(newInvitation)
    };
  }

  async getInvitationByToken({ token, email }: { token: string, email: string }) {
    const hashedToken = createHash('sha256').update(token).digest('hex');
    var invitation = await this.invitationRepository.findOne({ hashedToken, email }, ['clinic', 'role']);
    if (invitation.status == "pending" &&
      new Date(invitation.expires_at) < new Date()
    ) {
      invitation = await this.invitationRepository.findOneAndUpdate({ id: invitation.id }, { status: "expired" });
    }
    return invitation;
  }

  async updateInvitationStatus(id: string, status: InvitationType) {
    return await this.invitationRepository.findOneAndUpdate({ id }, { status });
  }
}
