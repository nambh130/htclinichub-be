import {
  AUTH_SERVICE,
  CreateReservationDto,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

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
}
