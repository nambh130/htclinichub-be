import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AnalyzeHealthcareDataService implements OnModuleInit {
    constructor(
        @Inject(INPUT_VITAL_SIGNS_SERVICE)
        private readonly IVSClient: ClientKafka,
        @Inject(AUTH_SERVICE)
        private readonly authClient: ClientKafka,
      ) { }
    
      async onModuleInit() {
        this.patientClient.subscribeToResponseOf('create-patient');
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
}
