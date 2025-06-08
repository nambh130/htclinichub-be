import { Body, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserDto } from '@app/common';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @MessagePattern('create-user')
  async createUser(@Payload() dto: UserDto) {
    return this.userService.create(dto);
  }
}
