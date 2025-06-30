import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import { Request, Response } from 'express';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { EventPattern, Payload } from '@nestjs/microservices';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
  async clinicUserLogin(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.clinicUserLogin(req, res);
    return response;
  }

  @Post('admin/login')
  async adminLogin(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.adminLogin(req, res);
    return response;
  }

  // ------------------------------INVITATION ------------------------------
  @Post('invitation')
  async createInvitation(
    @Body() invitationDto: CreateInvitationDto,
    @Req() req: Request,
  ) {
    const response = await this.authService.createInvitation(
      invitationDto,
      req,
    );
    return response;
  }

  @Post('invitation/check')
  async invitationCheck(@Req() req: Request) {
    return await this.authService.invitationCheck(req);
  }
  // ------------------------------ LOGUT, REFRESH ------------------------------
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.refreshToken(req, res);
    return response;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.logout(req, res);
    return response;
  }

  @Post('recover-password')
  async recoverPassowrd(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.recoverPassword(req, res)
    return response
  }

  @Post('reset-password')
  async resetPassword(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.resetPassword(req, res)
    return response
  }
}
