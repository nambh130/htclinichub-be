import { Inject, Injectable } from '@nestjs/common';
import {
  CreateReservationDto,
  ReservationCreatedEvent,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { ReservationsRepository } from './reservations.repository';
import { ClientKafka } from '@nestjs/microservices';
import { ReservationsPostgresRepository } from './reservations.postgres.repository';
import { Reservation } from './models/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly reservationsPostgresRepository: ReservationsPostgresRepository,
    @Inject(RESERVATIONS_SERVICE)
    private readonly reservationsClient: ClientKafka,
  ) {}

  async createReservation(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    const reservation = await this.reservationsRepository.create({
      ...createReservationDto,
      userId,
      timestamp: new Date(),
    });

    const event = new ReservationCreatedEvent(
      reservation._id.toString(),
      reservation.timestamp,
      reservation.userId,
      reservation.placeId,
    );

    this.reservationsClient.emit('reservation-created', event);

    return reservation;
  }

  async createReservationPostgres(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    const reservation = new Reservation();
    reservation.timestamp = new Date();
    reservation.userId = userId;
    reservation.placeId = createReservationDto.placeId;

    return this.reservationsPostgresRepository.create(reservation);
  }
}
