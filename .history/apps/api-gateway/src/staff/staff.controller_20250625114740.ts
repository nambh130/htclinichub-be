import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateDoctorAccountDto, CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { ManageDoctorScheduleService } from './manage-doctor-schedule/manage-doctor-schedule.service';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly manageDoctorScheduleService: ManageDoctorScheduleService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  createDoctorAccount(@Body() dto: CreateDoctorAccountDto) {
    return this.staffService.create(dto);
  }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
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
      const patient = await this.manageDoctorScheduleService
      .getViewWorkingShiftService(doctorId, user._id.toString());
      return doctorId;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
