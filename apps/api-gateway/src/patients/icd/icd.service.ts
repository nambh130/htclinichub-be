import { PATIENT_SERVICE, TokenPayload } from '@app/common';
import { CreateAppointmentDto } from '@app/common/dto/appointment';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ICDService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
  ) {}

  async searchICD(keyword: string, limit: number = 20) {
    const result = await firstValueFrom(
      this.httpService.get(`/patient-service/icd/search`, {
        params: {
          keyword,
          limit,
        },
      }),
    );
    return result.data;
  }
}
