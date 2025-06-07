import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDocument, UserDto } from '@app/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user and return token' })
  @ApiBody({ type: UserDto })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: {
        user: {
          email: 'user@example.com',
          role: 'user',
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
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
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: UserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async createUser(@Body() userDto: UserDto) {
    return this.authService.createUser(userDto);
  }
}
