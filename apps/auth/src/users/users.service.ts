import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import bcrypt from 'bcryptjs';
import { getUserDto } from './dto/get-user.dto';
import { RpcException } from '@nestjs/microservices';
import { UserDto } from '@app/common';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: UserDto) {
    try {
      await this.validateCreateUserDto(dto);
      return this.usersRepository.create({
        ...dto,
        password: await bcrypt.hash(dto.password, 10),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new RpcException({
          message: error.message,
          type: error.name,
          stack: error.stack,
        });
      }
    }
  }

  private async validateCreateUserDto(dto: UserDto) {
    try {
      await this.usersRepository.findOne({ email: dto.email });
    } catch (err) {
      return err as string;
    }
    throw new UnprocessableEntityException('Email already exists.');
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });

    // Check if user exists first
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
  async getUser(getUserDto: getUserDto) {
    return this.usersRepository.findOne(getUserDto);
  }

  async getAllUsers() {
    return this.usersRepository.getAllUsers();
  }
}
