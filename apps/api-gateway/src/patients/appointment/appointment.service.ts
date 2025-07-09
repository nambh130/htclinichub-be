import {
  AUTH_SERVICE,
  CreatePatientDto,
  UpdatePatientDto,
  PATIENT_SERVICE,
  TokenPayload,
} from '@app/common';
import { CreateAppointmentDto } from '@app/common/dto/appointment';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppointmentService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
  ) {}

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    user: TokenPayload,
  ) {
    const result = await firstValueFrom(
      this.httpService.post('/patient-service/appointment', {
        createAppointmentDto,
        user,
      }),
    );
    return result.data;
  }

  async getAppointmentsByPatientAccountId(id: String) {
    const result = await firstValueFrom(
      this.httpService.get(
        `/patient-service/appointment/patient-account/${id}`,
      ),
    );
    return result.data;
  }

  async getAppointment(id: String) {
    const result = await firstValueFrom(
      this.httpService.get(`/patient-service/appointment/${id}`),
    );
    return result.data;
  }

  async cancelAppointment(id: String) {
    const result = await firstValueFrom(
      this.httpService.put(`/patient-service/cancel-appointment/${id}`),
    );
    return result.data;
  }
}
