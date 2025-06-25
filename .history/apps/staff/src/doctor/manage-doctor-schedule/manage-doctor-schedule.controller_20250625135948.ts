import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateDoctorAccountDto } from '@app/common';
import { ManageDoctorScheduleService } from './manage-doctor-schedule.service';

@Controller()
export class ManageDoctorScheduleController {
  constructor(private readonly manageDoctorScheduleService: ManageDoctorScheduleService) { }

  @MessagePattern('doctor-view-working-shift')
  async getViewWorkingShiftController(
    @Payload()
    data: {
      doctorId: string;
      userId: string;
    },
  ) {
    try {
      const { doctorId, userId } = data;
      const doctor = await this.manageDoctorScheduleService.getViewWorkingShiftService(doctorId, userId);
      return doctor;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

   @MessagePattern('doctor-view-working-shift')
  async getViewWorkingShiftController(
    @Payload()
    data: {
      doctorId: string;
      userId: string;
    },
  ) {
    try {
      const { doctorId, userId } = data;
      const doctor = await this.manageDoctorScheduleService.getViewWorkingShiftService(doctorId, userId);
      return doctor;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }


}
