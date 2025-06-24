import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyzeHealthcareDataService implements OnModuleInit {
  constructor(
    @Inject(INPUT_VITAL_SIGNS_SERVICE)
    private readonly INPUT_VITAL_SIGNS_Client: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.INPUT_VITAL_SIGNS_Client.subscribeToResponseOf('input-vital-signs-data');
    this.INPUT_VITAL_SIGNS_Client.subscribeToResponseOf('get-vital-signs-data');
    this.INPUT_VITAL_SIGNS_Client.subscribeToResponseOf('update-vital-signs-data');

    this.authClient.subscribeToResponseOf('authenticate');

    await this.INPUT_VITAL_SIGNS_Client.connect();
    await this.authClient.connect();
  }

  async inputVital(
    inputVitalDto: InputVitalDto,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.INPUT_VITAL_SIGNS_Client.send('input-vital-signs-data', { inputVitalDto, userId })
      );
      console.log('input Vital API-GATEWAY successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async getVitalSignsDataByPatientId(
    patientId: String,
    userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.INPUT_VITAL_SIGNS_Client.send('get-vital-signs-data', { patientId, userId })
      );
      console.log('input Vital API-GATEWAY successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

    async updatePatient(
      patient_account_id: string,
      updatePatientDto: UpdatePatientDto,
      userId: string,
    ) {
      try {
        const result = await firstValueFrom(
          this.patientClient.send('update-patient', { patient_account_id, updatePatientDto, userId })
        );
        // return {
        //   "Patient update successfully Patient Services": result,
        // };
        return result;
      } catch (error) {
        console.error('Error update patient:', error);
        throw error;
      }
    }
}
