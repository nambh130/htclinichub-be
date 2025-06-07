import {
  AUTH_SERVICE,
  CreatePatientDto,
  UpdatePatientDto,
  PATIENT_SERVICE,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PatientService implements OnModuleInit {
  constructor(
    @Inject(PATIENT_SERVICE)
    private readonly patientClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.patientClient.subscribeToResponseOf('create-patient');
    this.patientClient.subscribeToResponseOf('update-patient');
    this.patientClient.subscribeToResponseOf('delete-patient');
    this.patientClient.subscribeToResponseOf('get-patient-by-id');
    this.patientClient.subscribeToResponseOf('get-patient-by-fullName');
    this.patientClient.subscribeToResponseOf('get-patient-by-phone');
    this.patientClient.subscribeToResponseOf('get-all-patients');

    this.authClient.subscribeToResponseOf('authenticate');

    await this.patientClient.connect();
    await this.authClient.connect();
  }

  // Patient-related methods
  async createPatient(
    createPatientDto: CreatePatientDto,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('create-patient', { createPatientDto, userId })
      );
      console.log('Patient created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(
    patient_account_id: string,
    updatePatientDto: UpdatePatientDto,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('update-patient', { patient_account_id, updatePatientDto, userId })
      );
      // return {
      //   "Patient update successfully Patient Services": result,
      // };
      return result;
    } catch (error) {
      console.error('Error update patient:', error);
      throw error;
    }
  }

  async deletePatient(
    id: string,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('delete-patient', { id, userId })
      );
      return result;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async getPatientById(
    id: string,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('get-patient-by-id', { id, userId })
      );
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByFullName(
    fullName: string,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('get-patient-by-fullName', { fullName, userId })
      );
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByPhoneNumber(
    phoneNumber: string,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('get-patient-by-phone', { phoneNumber, userId })
      );
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getAllPatients(
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('get-all-patients', { userId })
      );
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
