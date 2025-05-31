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
      userId: string; 
    },
  ) {
    const { addClinicDto, userId } = payload;
    return this.clinicsService.addClinic(addClinicDto, userId);
  }

  @EventPattern('clinic-added')
  handleClinicAdded(@Payload() clinicAddedEvent: ClinicAddedEvent) {
    clinicAddedEvent.toString();
  }
}
