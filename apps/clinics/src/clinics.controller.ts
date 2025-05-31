import { Controller } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { CreateReservationDto, ReservationCreatedEvent } from '@app/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AddClinicDto } from '@app/common/dto/clinic';
import { ClinicAddedEvent } from '@app/common/events/clinics';

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}
  @MessagePattern('add-clinic')
  async addClinic(
    @Payload()
    payload: {
      addClinicDto: AddClinicDto;
    },
  ) {
    const { addClinicDto } = payload;
    return this.clinicsService.addClinic(addClinicDto);
  }

  @EventPattern('clinic-added')
  handleClinicAdded(@Payload() clinicAddedEvent: ClinicAddedEvent) {
    clinicAddedEvent.toString();
  }
}
