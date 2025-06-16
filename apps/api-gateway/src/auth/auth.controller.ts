import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import { Response } from 'express';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  //@Post('login')
  //@ApiOperation({ summary: 'Login user and return token' })
  //@ApiBody({ type: UserDto })
  //@ApiResponse({
  //  status: 200,
  //  description: 'User logged in successfully',
  //  schema: {
  //    example: {
  //      user: {
  //        email: 'user@example.com',
  //        role: 'user',
  //      },
  //      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  //    },
  //  },
  //})
  //async login(
  //  @Body() dto: LoginDto,
  //  @Res({ passthrough: true }) response: Response,
  //) {
  //  const { user, token } = (await this.authService.login(dto)) as {
  //    user: UserDocument;
  //    token: string;
  //  };
  //  response.cookie('Authentication', token, { httpOnly: true });
  //  return { user, token };
  //}

  // ------------------------------ PATIENT ------------------------------
  @Post('patient/login/request-otp')
  @ApiOperation({ summary: 'Patient login with phone number' })
  @ApiBody({ type: LoginOtpRequestDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async requestOtp(@Body() otpRequestDto: LoginOtpRequestDto) {
    return this.authService.requestOtp(otpRequestDto);
  }

  @Post('patient/login/verify-otp')
  @ApiOperation({ summary: 'Patient login with phone number' })
  @ApiBody({ type: LoginOtpRequestDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async verifyOtp(@Body() verifyOtpDto: LoginOtpVerifyDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  // ------------------------------ STAFF AND DOCTOR ------------------------------
  @Post('clinic/login')
  @ApiOperation({ summary: 'Patient login with phone number' })
  @ApiBody({ type: ClinicUserLoginDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async clinicUserLogin(
    @Body() loginDto: ClinicUserLoginDto,
    @Res() res: Response
  ) {
    const response = await this.authService.clinicUserLogin(loginDto);

    // Set cookie
    res.cookie('token', response?.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // Send response manually
    res.json({
      user: response.user,
      message: 'Login successful',
    });
  }

  // ------------------------------INVITATION ------------------------------
  @Post('invitation')
  async createInvitation(@Body() invitationDto: CreateInvitationDto){
    this.authService.createInvitation(invitationDto);
  }
}
