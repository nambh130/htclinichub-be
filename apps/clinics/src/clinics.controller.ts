import { Controller } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AddClinicDto } from '@app/common/dto/clinic';
import { ClinicAddedEvent } from '@app/common/events/clinics';

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) { }
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

  @MessagePattern('get-clinics')
  async getClinics(
    @Payload()
    payload: {
      userId: string;
      options?: { limit?: number; page?: number };
    },
  ) {
    const { userId, options } = payload;
    return this.clinicsService.getClinics(userId, options);
  }

  // Get by one id
  @MessagePattern('get-clinic-by-id')
  async getClinicById(@Payload() payload: { id: string; userId: string }) {
    const { id, userId } = payload;
    return this.clinicsService.getClinicById(id, userId);
  }

  // Get by array of ids
  @MessagePattern('get-clinics-by-ids')
  async getClinicByIds(@Payload() payload: { ids: string[] }) {
    const clinics = await this.clinicsService.getClinicByIds(payload.ids);

    const transformed = clinics.map(clinic => {
      return {
        id: clinic.id,
        email: clinic.email,
        name: clinic.name,
        phone: clinic.phone,
        location: clinic.location,
        ownerId: clinic.ownerId
      };
    });

    return transformed
  }

  @MessagePattern('update-clinic')
  async updateClinic(
    @Payload()
    payload: {
      id: string;
      updateClinicDto: AddClinicDto;
      userId: string;
    },
  ) {
    const { id, updateClinicDto, userId } = payload;
    return this.clinicsService.updateClinic(id, updateClinicDto, userId);
  }

  @MessagePattern('delete-clinic')
  async deleteClinic(@Payload() payload: { id: string; userId: string }) {
    const { id, userId } = payload;
    return this.clinicsService.deleteClinic(id, userId);
  }

  // Event handlers
  @EventPattern('clinic-added')
  handleClinicAdded(@Payload() clinicAddedEvent: ClinicAddedEvent) {
    clinicAddedEvent.toString();
  }
}
