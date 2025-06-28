import {
  AUTH_SERVICE,
  FavouriteDoctorDto,
  PATIENT_SERVICE,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DownLoadMedicalReportService implements OnModuleInit {
  constructor(
    @Inject(PATIENT_SERVICE)
    private readonly patientClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.patientClient.subscribeToResponseOf('download-medical-report');
    this.authClient.subscribeToResponseOf('authenticate');

    await this.patientClient.connect();
    await this.authClient.connect();
  }

  // Patient-related methods

  async downloadMedicalReport(
    userId: string,
    patient_account_id: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('download-medical-report', { userId, patient_account_id })
      );
      return result;
    } catch (error) {
      console.error('Error add doctor:', error);
      throw error;
    }
  }
}
