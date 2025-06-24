import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { InputVitalDto, UpdateVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AnalyzeHealthcareDataRepository } from './analyze-healthcare-data.repository';
import { Types } from 'mongoose';

@Injectable()
export class AnalyzeHealthcareDataService {
  constructor(
    @Inject(INPUT_VITAL_SIGNS_SERVICE)
    private readonly INPUT_VITAL_SIGNS_Client: ClientKafka,
    private readonly analyzeHealthcareDataRepository: AnalyzeHealthcareDataRepository,

  ) { }

  async inputVital(
    inputVitalDto: InputVitalDto,
    userId: string,
  ) {
    try {
      const vitalsData = {
        spo2: inputVitalDto.spo2,
        heartRate: inputVitalDto.heartRate,
        respiratoryRate: inputVitalDto.respiratoryRate,
        temperature: inputVitalDto.temperature,
        bloodPressure: {
          systolic: inputVitalDto.bloodPressure.systolic,
          diastolic: inputVitalDto.bloodPressure.diastolic,
        },
        source: inputVitalDto.source,
        patientId: new Types.ObjectId(inputVitalDto.patientId)
      }

      const vitalsDataToDB = await this.analyzeHealthcareDataRepository.insertVitalSigns(vitalsData);
      console.log('Patient saved:', vitalsDataToDB);
      return vitalsDataToDB;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async getVitalSignsDataByPatientId(patientId: string, userId: string) {
    if (!patientId) {
      throw new NotFoundException('Invalid patientId');
    }

    try {
      const vitalsData = await this.analyzeHealthcareDataRepository.findOne({ patientId: new Types.ObjectId(patientId) });

      if (!vitalsData) {
        throw new NotFoundException(`Patient with id ${patientId} not found`);
      }

      return {
        data: {
          patientId: vitalsData.patientId,
          spo2: vitalsData.spo2,
          heartRate: vitalsData.heartRate,
          respiratoryRate: vitalsData.respiratoryRate,
          temperature: vitalsData.temperature,
          bloodPressure: {
            systolic: vitalsData.bloodPressure?.systolic,
            diastolic: vitalsData.bloodPressure?.diastolic,
          },
          source: vitalsData.source,
        }
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async updateVitalService(
      patientId: string,
      updateVitalDto: UpdateVitalDto,
      userId: string,
    ) {
      if (!patientId) {
        throw new NotFoundException('Invalid patient_account_id');
      }
  
      try {
        // const patient = await this.patientsRepository.findOne({
        //   patient_account_id: parseInt(patient_account_id),
        // });
  
        // if (!patient) {
        //   throw new NotFoundException(`Patient with patient_account_id ${patient_account_id} not found`);
        // }
  
        const updatedPatient = await this.patientsRepository.findOneAndUpdate(
          patient,
          {
            ...updatePatientDto,
            updatedBy: userId,
            updatedAt: new Date(),
          },
        );
  
        if (!updatedPatient) {
          throw new NotFoundException(`Patient with patient_account_id ${patient_account_id} not updated`);
        }
  
        return updatedPatient;
      } catch (error) {
        console.error('Error updating patient:', error);
        throw error;
      }
    }
}
