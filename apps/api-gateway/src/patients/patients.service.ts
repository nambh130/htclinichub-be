import {
  AUTH_SERVICE,
  CreatePatientDto,
  PATIENT_SERVICE,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';  

@Injectable()
export class PatientService {
  constructor(
    @Inject(PATIENT_SERVICE)
    private readonly patientClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) {}

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
  ){
return firstValueFrom(
  this.patientClient.send('create-patient', { createPatientDto, userId })
);  }
}
