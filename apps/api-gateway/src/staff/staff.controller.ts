import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import {
  CreateDoctorAccountDto,
  CurrentUser,
  JwtAuthGuard,
  UserDocument,
} from '@app/common';

@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

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
    @Param('id') doctorId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.lockDoctorAccount(doctorId, user);
  }

  @Post('create-doctor-profile')
  @UseGuards(JwtAuthGuard)
  async createDoctorProfile(
    @Body() dto: CreateDoctorAccountDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.staffService.createDoctorAccount(dto, user);
  }
}
