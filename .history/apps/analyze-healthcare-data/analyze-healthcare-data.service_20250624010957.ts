import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AnalyzeHealthcareDataRepository } from './analyze-healthcare-data.repository';

@Injectable()
export class AnalyzeHealthcareDataService {
  constructor(
    @Inject(INPUT_VITAL_SIGNS_SERVICE)
    private readonly INPUT_VITAL_SIGNS_Client: ClientKafka,
    private readonly analyzeHealthcareDataRepository: AnalyzeHealthcareDataRepository,

  ) { }

  // Patient-related methods
  async inputVital(
    inputVitalDto: InputVitalDto,
    userId: string,
  ) {
    try {
      const vitalsData = {
        spo2: ,
        heartRate,
        respiratoryRate,
        temperature,
        bloodPressure: {
          systolic: bloodPressure?.systolic ?? undefined,
          diastolic: bloodPressure?.diastolic ?? undefined,
        },
        source,
        createdBy: userId,
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
}
