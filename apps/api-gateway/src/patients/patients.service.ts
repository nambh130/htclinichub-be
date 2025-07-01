import {
  AUTH_SERVICE,
  CreatePatientDto,
  UpdatePatientDto,
  PATIENT_SERVICE,
  TokenPayload,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PatientService {
  constructor(
    @Inject(PATIENT_SERVICE)private readonly httpService: HttpService) { }

  // Patient-related methods
  async createPatient(
    createPatientDto: CreatePatientDto,
    currentUser: TokenPayload
  ) {
    try {
      const payload = { createPatientDto, currentUser };

      const response = await firstValueFrom(
        this.httpService.post('/patient-service/create-patient', payload),
      );
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(
    patient_account_id: string,
    updatePatientDto: UpdatePatientDto,
    currentUser: TokenPayload
  ) {
    try {
      const payload = {
        updatePatientDto,
        currentUser,
      };

      const result = await firstValueFrom(
        this.httpService.put(`/patient-service/update-patient/${patient_account_id}`, payload),
      );

      return result.data;
    } catch (error) {
      console.error('Error update patient:', error?.response?.data || error);
      throw error;
    }
  }

  async deletePatient(id: string, currentUser: TokenPayload) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/patient-service/delete-patient/${id}`)
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error?.response?.data || error.message);
    }
  }

  async getPatientById(
    id: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-id/${id}`)
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByFullName(
    fullName: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-fullName/${fullName}`)
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByPhoneNumber(
    phoneNumber: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-phone/${phoneNumber}`)
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

   async getPatientByCid(
    cid: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-cid/${cid}`)
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByHid(
    hid: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-hid/${hid}`)
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getAllPatients(
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get('/patient-service/get-all-patients')
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientProfileByAccountId(
    account_id: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patientProfile-by-account_id/${account_id}`)
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
