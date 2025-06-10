import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, UserDocument, UserDto } from '@app/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto';

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
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = (await this.authService.login(dto)) as {
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
  @Post('/request-otp')
  @ApiOperation({ summary: 'Patient login with phone number' })
  @ApiBody({ type: LoginOtpRequestDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async requestOtp(@Body() otpRequestDto: LoginOtpRequestDto) {
    return this.authService.requestOtp(otpRequestDto);
  }

  @Post('/verify-otp')
  @ApiOperation({ summary: 'Patient login with phone number' })
  @ApiBody({ type: LoginOtpRequestDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async verifyOtp(@Body() verifyOtpDto: LoginOtpVerifyDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }
}
