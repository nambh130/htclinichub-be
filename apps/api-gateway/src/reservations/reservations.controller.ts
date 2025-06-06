import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from '@app/common';
import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('create-reservation')
  @UseGuards(JwtAuthGuard)
  createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.reservationsService.createReservation(
      createReservationDto,
      user._id.toString(),
    );
  }

  @Post('create-reservation-postgres')
  @UseGuards(JwtAuthGuard)
  createReservationPostgres(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.reservationsService.createReservationPostgres(
      createReservationDto,
      user._id.toString(),
    );
  }
}
