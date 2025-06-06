import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDocument, UserDto } from '@app/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() userDto: UserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = (await this.authService.login(userDto)) as {
      user: UserDocument;
      token: string;
    };
    response.cookie('Authentication', token, { httpOnly: true });
    return { user, token };
  }

  @Post('create-user')
  async createUser(@Body() userDto: UserDto) {
    return this.authService.createUser(userDto);
  }
}
