import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
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
      throw new NotFoundException('Invalid id');
    }

    try {
      const vitalsData = await this.analyzeHealthcareDataRepository.findOne({ patientId: patientId });

      if (!vitalsData) {
        throw new NotFoundException(`Patient with id ${patientId} not found`);
      }

      return {
        data: {
          patientId: vitalsData.patientId,
          spo2: 98,
          heartRate: 75,
          respiratoryRate: 18,
          temperature: 36.6,
          bloodPressure: {
            systolic: 120,
            diastolic: 80,
          },
          source: 'nurse',
        }
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
