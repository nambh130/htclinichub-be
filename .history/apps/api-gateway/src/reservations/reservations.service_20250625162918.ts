import {
  AUTH_SERVICE
  CreateReservationDto,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
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
export class ReservationsService {
  constructor(
    @Inject(RESERVATIONS_SERVICE)
    private readonly reservationsClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.reservationsClient.subscribeToResponseOf('create-reservation');
    this.reservationsClient.subscribeToResponseOf(
      'create-reservation-postgres',
    );

<<<<<<< HEAD
=======
    // Auth-related subscriptions
    this.authClient.subscribeToResponseOf('login');
    this.authClient.subscribeToResponseOf('authenticate');
    this.authClient.subscribeToResponseOf('create-user');

>>>>>>> dev
    this.authClient.subscribeToResponseOf('authenticate');

    await this.reservationsClient.connect();
    await this.authClient.connect();
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
<<<<<<< HEAD
}
=======

  async login(userDto: UserDto): Promise<{ user: any; token: string }> {
    return firstValueFrom(this.authClient.send('login', userDto));
  }

  async createUser(userDto: UserDto): Promise<{ user: any; token: string }> {
    return firstValueFrom(this.authClient.send('create-user', userDto));
  }
}
>>>>>>> dev
