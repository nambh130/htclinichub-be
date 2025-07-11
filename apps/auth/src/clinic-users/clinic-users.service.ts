import { Injectable } from '@nestjs/common';
import { ClinicUserRepository } from './clinic-users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './models/clinic-user.entity';
import * as bcrypt from 'bcrypt';
import { ClinicRepository } from '../clinics/clinics.repository';
import { RoleRepository } from '../roles/roles.repository';
import { In } from 'typeorm';
import { ActorType } from '@app/common';

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

    const newUser = new User({
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

  async findUserByIds(ids: string[]) {
    return await this.userRepository.find({ id: In(ids) });
  }

  async find(query: Partial<User>) {
    return await this.userRepository.findOne(query, {
      roles: {
        permissions: true,
      },
      clinics: {
        owner: true,
      },
      ownerOf: true,
    });
  }

  async findByEmailAndClinic(
    email: string,
    clinicId: string,
    actorType: ActorType,
  ) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.clinics', 'clinic')
      .where('user.email = :email', { email })
      .andWhere('clinic.id = :clinicId', { clinicId })
      .andWhere('user.actor_type = :actorType', { actorType })
      .getOne();
  }

  async updateUser(email: string, updateData: Partial<User>): Promise<User> {
    return await this.userRepository.create(new User(updateData));
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  }
}
