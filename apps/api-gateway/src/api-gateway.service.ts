import {
  RESERVATIONS_SERVICE,
  CreateReservationDto,
  UserDto,
  AUTH_SERVICE,
  CLINIC_SERVICE,
  PATIENT_SERVICE,
  CreatePatientDto
} from '@app/common';
import { Response } from 'express';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AddClinicDto,
  ClinicDto,
  UpdateClinicDto,
} from '@app/common/dto/clinic';
import { In } from 'typeorm';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject(RESERVATIONS_SERVICE)
    private readonly reservationsClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
    @Inject(CLINIC_SERVICE)
    private readonly clinicClient: ClientKafka,
    @Inject(PATIENT_SERVICE)
    private readonly patientClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.reservationsClient.subscribeToResponseOf('create-reservation');
    this.reservationsClient.subscribeToResponseOf(
      'create-reservation-postgres',
    );

    // Auth-related subscriptions
    this.authClient.subscribeToResponseOf('login');
    this.authClient.subscribeToResponseOf('authenticate');
    this.authClient.subscribeToResponseOf('create-user');

    // Clinic-related subscriptions
    this.clinicClient.subscribeToResponseOf('add-clinic');
    this.clinicClient.subscribeToResponseOf('get-clinics');
    this.clinicClient.subscribeToResponseOf('delete-clinic');
    this.clinicClient.subscribeToResponseOf('get-clinic-by-id');
    this.clinicClient.subscribeToResponseOf('update-clinic');

    //patient-related subscriptions
    this.patientClient.subscribeToResponseOf('create-patient');

    await this.clinicClient.connect();
    await this.reservationsClient.connect();
    await this.authClient.connect();
    await this.patientClient.connect();
  }

  createReservation(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    return this.reservationsClient.send('create-reservation', {
      createReservationDto,
      userId,
    });
  }

  createReservationPostgres(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    return this.reservationsClient.send('create-reservation-postgres', {
      createReservationDto,
      userId,
    });
  }

  async login(userDto: UserDto): Promise<{ user: any; token: string }> {
    return firstValueFrom(this.authClient.send('login', userDto));
  }

  async createUser(userDto: UserDto): Promise<{ user: any; token: string }> {
    return firstValueFrom(this.authClient.send('create-user', userDto));
  }

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
  async getClinics(userId: string): Promise<ClinicDto[]> {
    return firstValueFrom(this.clinicClient.send('get-clinics', { userId }));
  }

  async getClinicById(id: string, userId: string): Promise<ClinicDto> {
    return firstValueFrom(
      this.clinicClient.send('get-clinic-by-id', { id, userId }),
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

  // Patient-related methods
  async createPatient(
    createPatientDto: CreatePatientDto,
    userId: string,
  ): Promise<CreatePatientDto> {
        console.log('Creating patient with data:', createPatientDto, userId);
    return firstValueFrom(
      this.patientClient.send('create-patient', { createPatientDto, userId }),
    );
  }

}
