import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { ManageDoctorScheduleService } from './manage-doctor-schedule/manage-doctor-schedule.service';
import {
  CreateDoctorAccountDto,
  CreateEmployeeAccountDto,
  CurrentUser,
  JwtAuthGuard,
  UserDocument,
} from '@app/common';


@Controller('admin/staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly manageDoctorScheduleService: ManageDoctorScheduleService,
  ) { }

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

  // View Working Hours
  // Set Up Working Hours
  // Change Working Hours

  @Get('/doctor/view-working-shift/:doctorId')
  @UseGuards(JwtAuthGuard)
  async getViewWorkingShift(
    @Param('doctorId') doctorId: string,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const doctor = await this.manageDoctorScheduleService
      .getViewWorkingShiftService(doctorId, user._id.toString());
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

   @Get('/doctor/detail-shift/:shiftId')
  // @UseGuards(JwtAuthGuard)
  async getDetailShiftByShiftId(
    @Param('shiftId') shiftId: string,
    // @CurrentUser() user: UserDocument,
  ) {
    try {
      // const doctor = await this.manageDoctorScheduleService
      // .getDetailShift(shiftId,"1");
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
