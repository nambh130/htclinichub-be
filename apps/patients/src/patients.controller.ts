import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from '@app/common/dto';
import { PatientCreatedEvent } from '@app/common/events/patients';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @MessagePattern('create-patient')
  async createPatient(
      @Payload()
      payload: {
        createPatientDto: CreatePatientDto;
        userId: string;
      },
    ) {
      console.log('Patient Controller: ', payload);
      const { createPatientDto, userId } = payload;
      return this.patientsService.createPatient(createPatientDto, userId);
    }

    @EventPattern('patient-created')
      handleCreatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
        patientCreatedEvent.toString();
      }

  // @MessagePattern('findAllPatients')
  // findAll() {
  //   return this.patientsService.findAll();
  // }

  // @MessagePattern('findOnePatient')
  // findOne(@Payload() id: number) {
  //   return this.patientsService.findOne(id);
  // }

  // @MessagePattern('updatePatient')
  // update(@Payload() updatePatientDto: UpdatePatientDto) {
  //   return this.patientsService.update(updatePatientDto.id, updatePatientDto);
  // }

  // @MessagePattern('removePatient')
  // remove(@Payload() id: number) {
  //   return this.patientsService.remove(id);
  // }
}
