import {
    AUTH_SERVICE,
    STAFF_SERVICE,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService{
  constructor(
    private readonly patientsRepository: PatientRepository,
    @Inject(PATIENT_SERVICE)
    private readonly PatientsClient: ClientKafka,
  ) { }

 
  
}