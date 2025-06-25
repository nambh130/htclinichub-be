import { Injectable } from '@nestjs/common';
import { ClinicUserRepository } from './clinic-users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { ClinicUser } from './models/clinic-user.entity';
import * as bcrypt from 'bcrypt';
import { ClinicRepository } from '../clinics/clinics.repository';
import { RoleRepository } from '../roles/roles.repository';
import { ActorType } from '@app/common';
import { UserClinicLink } from './models/user-clinics-links.entity';

@Injectable()
export class ClinicUsersService {
  constructor(
    private readonly userRepository: ClinicUserRepository,
    private readonly clinicRepository: ClinicRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { role: roleId, clinic: clinicId, actorType } = createUserDto;
    const saltRounds = 12;
    const hash = await bcrypt.hash(createUserDto.password, saltRounds);

    const newUser = new ClinicUser({
      ...createUserDto,
      actorType: actorType,
      password: hash,
    });

    if (roleId) {
      const role = await this.roleRepository.findOne({ id: roleId });
      newUser.roles = [role];
    }
    // Add clinic to user_clinic_links table
    if (clinicId) {
      const clinic = await this.clinicRepository.findOne({ id: clinicId });
      newUser.clinics = [clinic];
    }

    return await this.userRepository.create(newUser);
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne(
      { email },
      {
        roles: {
          permissions: true,
        },
        clinics: {
          owner: true,
        },
        ownerOf: true,
      },
    );
  }
  async updateUser(email: string, updateData: Partial<ClinicUser>) {
    this.userRepository.create(new ClinicUser(updateData));
  }
}
