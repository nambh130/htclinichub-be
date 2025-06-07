import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from '@app/common/dto';
import { PatientCreatedEvent } from '@app/common/events/patients';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) { }

  @MessagePattern('create-patient')
  async createPatient(
    @Payload()
    data: {
      createPatientDto: CreatePatientDto;
      userId: string;
    },
  ) {
    try {
      const { createPatientDto, userId } = data;
      const createPatient = await this.patientsService.createPatient(createPatientDto, userId);
      return createPatient;
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
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

  @MessagePattern('update-patient')
  async updatePatient(
    @Payload()
    data: {
      patient_account_id: string;
      updatePatientDto: UpdatePatientDto;
      userId: string;
    },
  ) {
    try {
      const { patient_account_id, updatePatientDto, userId } = data;
      const createPatient = await this.patientsService.updatePatient(
        patient_account_id,
        updatePatientDto,
        userId);
      //  return {
      //   "Patient update successfully Patient Controller": createPatient,
      // };
      return createPatient;
    } catch (error) {
      console.error('Error in updatePatient:', error);
      throw error;
    }
  }

  @EventPattern('patient-updated')
  handlUpdatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
    patientCreatedEvent.toString();
  }

  @MessagePattern('delete-patient')
  async removePatient(
    @Payload()
    data: {
      id: string;
      userId: string;
    },
  ) {
    try {
      const { id, userId } = data;
      const deletedPatient = await this.patientsService.deletePatient(id, userId);
      return deletedPatient;
    } catch (error) {
      console.error('Error in removePatient:', error);
      throw error;
    }
  }
}
