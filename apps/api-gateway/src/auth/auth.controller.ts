import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import { Request, Response } from 'express';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '@app/common';
import { EventPattern, Payload } from '@nestjs/microservices';

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

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: any) {
    console.log('User created event:', data);
  }

  @Post('patient/login/verify-otp')
  @ApiOperation({ summary: 'Patient login with phone number' })
  @ApiBody({ type: LoginOtpRequestDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async verifyOtp(@Req() req: Request, @Res() res: Response) {
    return await this.authService.verifyOtp(req, res);
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
    @Req() req: Request,
    @Res() res: Response
  ) {
    const response = await this.authService.clinicUserLogin(req, res);
    return response;
  }

  // ------------------------------INVITATION ------------------------------
  @Post('invitation')
  async createInvitation(@Body() invitationDto: CreateInvitationDto, @Req() req: Request) {
    const response = await this.authService.createInvitation(invitationDto, req);
    return response;
  }

  @Post('invitation/check')
  async invitationCheck(@Req() req: Request) {
    return await this.authService.invitationCheck(req);
  }
}
