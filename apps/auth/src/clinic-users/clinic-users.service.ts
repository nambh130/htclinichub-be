import { Injectable } from '@nestjs/common';
import { ClinicUserRepository } from './clinic-users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { ClinicUser } from './models/clinic-user.entity';

@Injectable()
export class ClinicUsersService {
  constructor(
    private readonly userRepository: ClinicUserRepository
  ){}

  async createUser(createUserDto: CreateUserDto){
    const newUser = new ClinicUser(createUserDto);
    return await this.userRepository.create(newUser);
  }
}
