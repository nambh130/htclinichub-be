import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ActorType, CreateDoctorAccountDto } from '@app/common';
import { ManageDoctorScheduleService } from './manage-doctor-schedule.service';

@Controller('manage-doctor-schedule')
export class ManageDoctorScheduleController {
  constructor(private readonly manageDoctorScheduleService: ManageDoctorScheduleService) { }

   @Get('doctor-view-working-shift')
  async getViewWorkingShiftController(
    @Payload()
    data: {
      doctorId: string;
      user: { id: string; type: ActorType };
    },
  ) {
    try {
      const doctor = await this.manageDoctorScheduleService.getViewWorkingShiftService(data.doctorId, data.user);
      return doctor;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

   @Get('detail-working-shift')
  async getDetailShiftController(
    @Payload()
    data: {
      shiftId: string;
      userId: string;
    },
  ) {
    try {
      // const { shiftId, userId } = data;
      // console.log("[DEBUG]: " + data.shiftId, data.userId)
      // const shift = await this.manageDoctorScheduleService.getDetailShiftService(shiftId, userId);
      return data.userId;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }


}
