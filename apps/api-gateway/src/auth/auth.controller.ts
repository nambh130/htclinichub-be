import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  Query,
  Patch,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import { Request, Response } from 'express';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ClinicService } from '../clinics/clinic.service';
import { ActorEnum } from '@app/common/enum/actor-type';
import { EmployeeService } from '@api-gateway/staff/employee/employee.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clinicService: ClinicService,
    private readonly employeeService: EmployeeService,
  ) { }

  @Post('/doctor')
  async createDoctor(@Req() req: Request, @Res() res: Response) {
    return this.authService.createDoctor(req, res);
  }
  @Post('/clinic-employee')
  async createEmployeeAccount(@Req() req: Request, @Res() res: Response) {
    return this.authService.createClinicEmployeeAccount(req, res);
  }
  @Post('/admin')
  async createAdminAccount(@Req() req: Request, @Res() res: Response) {
    return this.authService.createAdminAccount(req, res);
  }

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
    const loginData = await this.authService.clinicUserLogin(req);
    const { user } = loginData?.data;

    // Set cookie
    const setCookie = loginData.headers?.['set-cookie'];
    if (setCookie) res.setHeader('Set-Cookie', setCookie);

    if (user.actorType === ActorEnum.EMPLOYEE) {
      const employeeInfo = await this.employeeService.getEmployeeAccountById(user.id) as any
      console.log(employeeInfo)
      const { currentClinics, adminOf, ...rest } = user;

      const clinicData = await this.clinicService.getClinicById(
        employeeInfo.clinic_id,
        user.id,
      );

      return res.status(loginData.status).send({
        token: loginData.data.token,
        user: {
          ...rest,
        },
        currentClinic: {
          id: employeeInfo.clinic_id,
          name: clinicData.name,
        },
      });
    }

    // For non-employees, just forward the original response
    return res.status(loginData.status).send(loginData.data);
  }

  @Post('admin/login')
  async adminLogin(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.adminLogin(req, res);
    return response;
  }


  @Post('change-password')
  async changePassowrd(@Req() req: Request) {
    const response = await this.authService.changePassword(req);
    return response
  }

  // ------------------------------INVITATION ------------------------------
  @Post('invitation')
  async createInvitationOwner(
    @Body() invitationDto: CreateInvitationDto,
    @Req() req: Request,
  ) {
    const clinicData = await this.clinicService.getClinicById(
      invitationDto.clinic,
      'id',
    );
    console.log('data: ', clinicData);
    if (!clinicData) {
      throw new BadRequestException({
        ERR_CODE: 'CLINIC_NOT_FOUND',
        message: 'Clinic not found!',
      });
    }
    const response = await this.authService.createInvitation(
      {
        ...invitationDto,
        clinicName: clinicData.name,
      },
      req,
    );
    return response;
  }

  //@Post('invitation/admin')
  //async createInvitationAdmin(
  //  @Body() invitationDto: CreateInvitationDto,
  //  @Req() req: Request,
  //) {
  //  const response = await this.authService.createInvitationAdmin(
  //    invitationDto,
  //    req,
  //  );
  //  return response;
  //}

  @Post('invitation/check')
  async invitationCheck(@Req() req: Request) {
    const check = await this.authService.invitationCheck(req);
    if (check.clinicId) {
      try {
        const { clinicId, ...rest } = check;
        console.log(rest);
        const clinic = await this.clinicService.getClinicById(clinicId, '');
        if (clinic) {
          return {
            ...rest,
            clinic: {
              id: check.clinicId,
              name: clinic.name,
            },
          };
        }
      } catch (error) {
        console.log(error);
      }
    }
    return check;
  }

  @Post('invitation/signup')
  async invitationSignup(@Req() req: Request, @Res() res: Response) {
    return await this.authService.invitationSignup(req, res);
  }

  @Post('invitation/join-clinic')
  async invitationAccept(@Req() req: Request, @Res() res: Response) {
    return await this.authService.invitationAccept(req, res);
  }

  @Get('invitation/clinic')
  async invitationByClinic(
    @Query() query: Record<string, any>,
    @Req() req: Request,
  ) {
    return await this.authService.getInvitationByClinic(query, req);
  }

  @Patch('invitation/:id/revoke')
  async revokeInvitation(
    @Param() param: Record<string, string>,
    @Req() req: Request,
  ) {
    return await this.authService.revokeInvitation(param, req);
  }
  // ------------------------------ Roles ------------------------------
  @Get('roles/clinic')
  async getRolesForClinic(
    @Query() query: Record<string, any>,
    @Req() req: Request,
  ) {
    return await this.authService.getRolesForClinic(query, req);
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

  @Post('forget-password')
  async recoverPassowrd(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.recoverPassword(req, res);
    return response;
  }

  @Post('reset-password')
  async resetPassword(@Req() req: Request, @Res() res: Response) {
    const response = await this.authService.resetPassword(req, res);
    return response;
  }
}
