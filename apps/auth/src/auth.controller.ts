import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDocument, UserDto } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersRepository } from './users/users.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @MessagePattern('login')
  async login(userDto: UserDto) {
    const token = await this.authService.login(userDto);
    const user = (await this.usersRepository.findByEmail(
      userDto.email,
    )) as UserDocument;
    return { user, token };
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  authenticate(@Payload() data: any) {
    console.log(data);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return data.user;
  }
}
