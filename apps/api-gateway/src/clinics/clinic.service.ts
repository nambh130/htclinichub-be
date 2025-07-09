import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AUTH_SERVICE,
  CLINIC_SERVICE,
  CreateDoctorAccountDto,
} from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { STAFF_SERVICE } from '@app/common';
import {
  AddClinicDto,
  ClinicDto,
  UpdateClinicDto,
} from '@app/common/dto/clinic';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ClinicService implements OnModuleInit {
  constructor(
    @Inject(CLINIC_SERVICE) private readonly clinicClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.clinicClient.subscribeToResponseOf('add-clinic');
    this.clinicClient.subscribeToResponseOf('get-clinics');
    this.clinicClient.subscribeToResponseOf('delete-clinic');
    this.clinicClient.subscribeToResponseOf('get-clinic-by-id');
    this.clinicClient.subscribeToResponseOf('update-clinic');
    this.clinicClient.subscribeToResponseOf('get-clinics-by-ids');
    this.clinicClient.subscribeToResponseOf('get-clinics-by-ids.reply');
    this.authClient.subscribeToResponseOf('authenticate');

    await this.authClient.connect();
    await this.clinicClient.connect();
  }

  // create(dto: AddClinicDto) {
  //   return this.clinicClient.send('add-clinic', dto);
  // }
  async addClinic(
    addClinicDto: AddClinicDto,
    userId: string,
  ): Promise<ClinicDto> {
    return firstValueFrom(
      this.clinicClient.send('add-clinic', {
        addClinicDto,
        userId,
      }),
    );
  }

  async getClinics(
    userId: string,
    options?: { limit?: number; page?: number },
  ): Promise<any> {
    return firstValueFrom(
      this.clinicClient.send('get-clinics', { userId, options }),
    );
  }

  // Get by 1 id
  async getClinicById(id: string, userId: string): Promise<ClinicDto> {
    return firstValueFrom(
      this.clinicClient.send('get-clinic-by-id', { id, userId }),
    );
  }

  // Get by array of ids
  async getClinicByIds(
    ids: string[],
  ): Promise<any> {
    console.log({ ids })
    return firstValueFrom(
      this.clinicClient.send('get-clinics-by-ids', { ids }),
    );
  }

  async updateClinic(
    id: string,
    updateClinicDto: UpdateClinicDto,
    userId: string,
  ): Promise<ClinicDto> {
    return firstValueFrom(
      this.clinicClient.send('update-clinic', { id, updateClinicDto, userId }),
    );
  }

  async deleteClinic(id: string, userId: string): Promise<void> {
    return firstValueFrom(
      this.clinicClient.send('delete-clinic', { id, userId }),
    );
  }

}
