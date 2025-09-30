import { Injectable } from '@nestjs/common';
import { PatientRepository } from './patients.repository';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from './models/patient.entity';

@Injectable()
export class PatientsService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async createPatient(patient: CreatePatientDto): Promise<Patient> {
    const newPatient = new Patient(patient);
    return await this.patientRepository.create(newPatient);
  }

  async getPatient() {
    return await this.patientRepository.find({});
  }
}
