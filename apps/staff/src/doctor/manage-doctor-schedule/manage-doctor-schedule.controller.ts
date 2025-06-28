import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ActorType, CreateDoctorAccountDto, TokenPayload } from '@app/common';
import { ManageDoctorScheduleService } from './manage-doctor-schedule.service';

@Controller('manage-doctor-schedule')
export class ManageDoctorScheduleController {
  constructor(private readonly manageDoctorScheduleService: ManageDoctorScheduleService) { }

  @Get('doctor-view-working-shift/:doctorId')
  async getViewWorkingShiftController(
    @Param('doctorId') doctorId: string,
  ) {
    try {
      const doctor = await this.manageDoctorScheduleService.getViewWorkingShiftService(doctorId);
      return doctor;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('detail-working-shift/:shiftId')
  async getDetailShiftController(
    @Param('shiftId') shiftId: string,
  ) {
    try {
      console.log("[DEBUG]: " + shiftId)
      const shift = await this.manageDoctorScheduleService.getDetailShiftService(shiftId);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }
}
