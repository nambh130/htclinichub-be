import { Inject, Injectable } from '@nestjs/common';
import {
  CreateReservationDto,
  ReservationCreatedEvent,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { ReservationsRepository } from './reservations.repository';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
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
}
