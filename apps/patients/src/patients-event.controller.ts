import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { PatientCreated } from '@app/common/events/auth/patient-created.event';

@Controller()
export class PatientEventController {
  constructor(private readonly patientService: PatientsService) {}

  @EventPattern('patient-created')
  async handlePatientCreated(
    @Payload()
    payload: PatientCreated,
  ) {
    const { id, phone } = payload;
    await this.patientService.createPatientAccount({ id, phone });
  }

  
}
