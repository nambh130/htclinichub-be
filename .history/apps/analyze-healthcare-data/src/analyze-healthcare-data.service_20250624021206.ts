import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
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
    patientId: string
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
        patientId: new Types.ObjectId(patientId),
      }

      const vitalsDataToDB = await this.analyzeHealthcareDataRepository.insertVitalSigns(vitalsData);
      console.log('Patient saved:', vitalsDataToDB);
      return vitalsDataToDB;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
}
