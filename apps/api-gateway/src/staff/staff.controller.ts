import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import {
  CreateDoctorAccountDto,
  CreateEmployeeAccountDto,
  CurrentUser,
  JwtAuthGuard,
  UserDocument,
} from '@app/common';

@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  //Doctor-enpoints
  @Get('doctor-account-list')
  @UseGuards(JwtAuthGuard)
  async viewDoctorAccountList() {
    return this.staffService.viewDoctorAccountList();
  }

  @Post('create-doctor-account')
  @UseGuards(JwtAuthGuard)
  async createDoctorAccount(
    @Body() dto: CreateDoctorAccountDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.createDoctorAccount(dto, user);
  }

  @Post('lock-doctor-account/:id')
  @UseGuards(JwtAuthGuard)
  async lockDoctorAccount(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.lockDoctorAccount(id, user);
  }

  @Post('unlock-doctor-account/:id')
  @UseGuards(JwtAuthGuard)
  async unlockDoctorAccount(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.unlockDoctorAccount(id, user);
  }

  @Post('create-doctor-profile')
  @UseGuards(JwtAuthGuard)
  async createDoctorProfile(
    @Body() dto: CreateDoctorAccountDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.createDoctorProfile(dto, user);
  }

  //Employee-endpoints
  @Get('employee-account-list')
  @UseGuards(JwtAuthGuard)
  async viewEmployeeAccountList() {
    return this.staffService.viewEmployeeAccountList();
  }

  @Post('create-employee-account')
  @UseGuards(JwtAuthGuard)
  async createEmployeeAccount(
    @Body() dto: CreateEmployeeAccountDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.createEmployeeAccount(dto, user);
  }

  @Post('lock-employee-account/:id')
  @UseGuards(JwtAuthGuard)
  async lockEmployeeAccount(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.lockEmployeeAccount(id, user);
  }

  @Post('unlock-employee-account/:id')
  @UseGuards(JwtAuthGuard)
  async unlockEmployeeAccount(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.unlockEmployeeAccount(id, user);
  }
}
