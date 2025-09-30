import { ActorType, AUTH_SERVICE, BaseService } from '@app/common';
import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InvitationRepository } from './invitation.repository';
import { CreateInvitationDto } from './dto/create-invitaion.dto';
import { createHash, randomBytes } from 'crypto';
import { EmployeeInvitation, InvitationType } from './models/invitation.entity';
import { Clinic } from '../clinics/models/clinic.entity';
import { Role } from '../roles/models/role.entity';
import { RoleRepository } from '../roles/roles.repository';
import { ActorEnum } from '../clinic-users/models/clinic-user.entity';
import { ClinicUserRepository } from '../clinic-users/clinic-users.repository';
import { FindOptionsWhere } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { InvitationCreated } from '@app/common/events/auth/invitation-created.event';
import { ConfigService } from '@nestjs/config';
import { ClinicUsersService } from '@auth/clinic-users/clinic-users.service';

@Injectable()
export class InvitationsService extends BaseService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: ClinicUserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
    private readonly userService: ClinicUsersService,
    @Inject(AUTH_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) {
    super();
  }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async createInvitationWithValidation(
    createInvitationDto: CreateInvitationDto,
    user: { id: string; type: ActorType; adminOf?: string[] },
  ) {
    const { clinic, email, role } = createInvitationDto;
    createInvitationDto.email = email.toLowerCase().trim();

    // 1. Authorization check
    if (user.type === ActorEnum.DOCTOR && !user.adminOf?.includes(clinic)) {
      throw new ForbiddenException('You are not authorized to do this action');
    }

    // 2. Doctor cannot invite clinic owner
    if (user.type == ActorEnum.DOCTOR)
      createInvitationDto.isOwnerInvitation = false;

    // 3. Role existence and validation
    const fetchedRole = await this.roleRepository.findOne({ id: role });
    if(!fetchedRole) throw new BadRequestException("Role not found");

    // 4. If Doctor: Check if already exists in this clinic
    if (fetchedRole.roleType === ActorEnum.DOCTOR) {
      const checkUser = await this.userService.findByEmailAndClinic(
        createInvitationDto.email,
        clinic,
        ActorEnum.DOCTOR,
      );
      if (checkUser) {
        throw new BadRequestException({
          ERR_CODE: 'DOC_EXISTS',
          message: 'Doctor account already exists in this clinic!',
        });
      }
    }

    // 5. If Employee: Ensure not already registered system-wide
    if (fetchedRole.roleType === ActorEnum.EMPLOYEE) {
      const checkUser = await this.userService.find({
        email: createInvitationDto.email,
        actorType: ActorEnum.EMPLOYEE,
      });
      if (checkUser) {
        throw new BadRequestException({
          ERR_CODE: 'EMPLOYEE_EXISTS',
          message: 'Employee account already exists!',
        });
      }
    }

    // 6. Pass validated DTO to core invitation creation logic
    return this.createInvitation(createInvitationDto, {
      id: user.id,
      type: user.type,
    }, fetchedRole);
  }

  async createInvitation(
    createInvitationDto: CreateInvitationDto,
    user: { id: string; type: ActorType },
    role: Role
  ) {
    const { clinic, isOwnerInvitation } = createInvitationDto;
    const email = createInvitationDto.email.toLowerCase().trim();

    // Create token and the hash it
    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days in ms
    const userType = role.roleType;

    if (user.type != ActorEnum.ADMIN && role.roleType == ActorEnum.ADMIN) {
      throw new BadRequestException();
    }

    if (isOwnerInvitation && userType != ActorEnum.DOCTOR) {
      throw new BadRequestException('Only doctor account can be owner!');
    }

    // Create new Invitation object
    const newInvitation = new EmployeeInvitation({
      email,
      isOwnerInvitation,
      expires_at: expiresAt,
      role: { id: role.id } as Role,
      clinic: { id: clinic } as Clinic,
      hashedToken,
      createdById: user.id,
      createdByType: user.type,
    });

    const invitation = await this.invitationRepository.create(newInvitation);
    if (invitation) {
      const roleType = invitation.role.roleType;
      let translatedActorType: string;
      if (roleType === ActorEnum.DOCTOR) {
        translatedActorType = "Bác Sĩ";
      } else {
        translatedActorType = "Nhân Viên";
      }

      const invitationUrl = `${this.configService.get("INVITATION_URL")}?email=${encodeURIComponent(email)}&token=${token}`;
      // Emit an event that a new patient is added
      const invitationEvent = new InvitationCreated({
        to: email,
        invitationUrl,
        roleName: translatedActorType,
        clinicName: createInvitationDto.clinicName
      });
      console.log("invited: ", invitationUrl)
      this.kafkaClient.emit('invitation-created', invitationEvent.toString());
    }

    return { success: true };
  }

  async getInvitationByToken({
    token,
    email,
  }: {
    token: string;
    email: string;
  }) {
    const hashedToken = createHash('sha256').update(token).digest('hex');
    let invitation = await this.invitationRepository.findOne(
      { hashedToken, email },
      ['clinic', 'role'],
    );
    if (!invitation) {
      throw new BadRequestException("Invitation not found")
    } else if (
      invitation.status == 'pending' &&
      new Date(invitation.expires_at) < new Date()
    ) {
      invitation = await this.invitationRepository.findOneAndUpdate(
        { id: invitation.id },
        { status: 'expired' },
      );
    }
    return invitation;
  }

  async getInvitation({ page, limit, where }:
    { page: number, limit: number, where: FindOptionsWhere<EmployeeInvitation> }) {
    const take = limit;
    const skip = (page - 1) * take;

    const [data, total] = await this.invitationRepository.findAndCount(
      where,
      skip,
      take,
      ["role"],
      {
        createdAt: 'DESC'
      }
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async updateInvitationStatus(id: string, status: InvitationType) {
    return await this.invitationRepository.findOneAndUpdate({ id }, { status });
  }
}
