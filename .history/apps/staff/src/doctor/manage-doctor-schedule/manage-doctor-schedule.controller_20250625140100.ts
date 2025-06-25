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

   @MessagePattern('detail-working-shift')
  async getDetailShiftController(
    @Payload()
    data: {
      shiftId: string;
      userId: string;
    },
  ) {
    try {
      const { shiftId, userId } = data;
      const shift = await this.manageDoctorScheduleService.getViewWorkingShiftService(shiftId, userId);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }


}
