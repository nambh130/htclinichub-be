import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateDoctorAccountDto } from '@app/common';

@Controller()
export class ManageDoctorScheduleController {
  constructor(private readonly manageDoctorScheduleService: ManageDoctorScheduleService) { }

  @MessagePattern('doctor-view-working-shift')
  async getPatientById(
    @Payload()
    data: {
      id: string;
      userId: string;
    },
  ) {
    try {
      const { id, userId } = data;
      const patient = await this.patientsService.getPatientById(id, userId);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }
}
