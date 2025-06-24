import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AnalyzeHealthcareDataService implements OnModuleInit {
    constructor(
        @Inject(INPU)
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
}
