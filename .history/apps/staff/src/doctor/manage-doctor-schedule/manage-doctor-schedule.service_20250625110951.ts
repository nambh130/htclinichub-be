import {
    AUTH_SERVICE,
    STAFF_SERVICE,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService implements OnModuleInit {
@Injectable()
export class PatientsService {
  constructor(
    private readonly patientsRepository: PatientRepository,
    @Inject(PATIENT_SERVICE)
    private readonly PatientsClient: ClientKafka,
  ) { }

  async createPatient(createPatientDto: CreatePatientDto, userId: string) {
    const existedPhone = await this.patientsRepository.findByPhone(createPatientDto.phone);
    if (existedPhone) {
      throw new BadRequestException('Số điện thoại đã tồn tại!');
    }

    const patientData = {
      fullname: createPatientDto.fullname,
      patient_account_id: createPatientDto.patient_account_id,
      address1: createPatientDto.address1,
      address2: createPatientDto.address2 || '',
      gender: createPatientDto.gender,
      ethnicity: createPatientDto.ethnicity,
      marital_status: createPatientDto.marital_status,
      nation: createPatientDto.nation,
      work_address: createPatientDto.work_address,
      relation: createPatientDto.relation,
      phone: createPatientDto.phone,
      dOB: createPatientDto.dOB,
      createdBy: userId,
      medical_history: {
        allergies: createPatientDto.medical_history.allergies,
        personal_history: createPatientDto.medical_history.personal_history,
        family_history: createPatientDto.medical_history.family_history,
      },
    };

    try {
      const patient = await this.patientsRepository.createPatient(patientData);
      console.log('Patient saved:', patient);
      return patient;
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  }
}