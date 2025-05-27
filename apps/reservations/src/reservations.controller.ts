import { Controller } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, ReservationCreatedEvent } from '@app/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @MessagePattern('create-reservation')
  async createReservation(
    @Payload()
    payload: {
      createReservationDto: CreateReservationDto;
      userId: string;
    },
  ) {
    const { createReservationDto, userId } = payload;
    return this.reservationsService.createReservation(
      createReservationDto,
      userId,
    );
  }

  @EventPattern('reservation-created')
  handleReservationCreated(
    @Payload() reservationCreatedEvent: ReservationCreatedEvent,
  ) {
    reservationCreatedEvent.toString();
  }
}
