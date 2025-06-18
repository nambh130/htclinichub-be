import { BaseService } from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InvitationRepository } from './invitation.repository';
import { CreateInvitationDto } from './dto/create-invitaion.dto';
import { createHash, randomBytes } from 'crypto';
import { EmployeeInvitation, InvitationType } from './models/invitation.entity';
import { Clinic } from '../clinics/models/clinic.entity';
import { Role, RoleEnum } from '../roles/models/role.entity';
import { RoleRepository } from '../roles/roles.repository';

@Injectable()
export class InvitationsService extends BaseService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly roleRepository: RoleRepository
  ) { super() }

  async createInvitation(createInvitationDto: CreateInvitationDto) {
    const { email, clinic, role } = createInvitationDto;
    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 *24 * 7); // 7 days in ms

    // Only doctor roles can be invited
    const invitedRole = await this.roleRepository.findOne({id: role});
    if(invitedRole.roleType != RoleEnum.DOCTOR){
      throw new BadRequestException("This role can not be invited!");
    }
    // Create new Invitation object
    const newInvitation = new EmployeeInvitation({
      email,
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

  async updateInvitationStatus(id: string, status: InvitationType){
    return await this.invitationRepository.findOneAndUpdate({id},{status});
  }
}
