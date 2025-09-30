import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { ClinicsService } from './clinics.service';

@Controller()
export class ClinicEventController {
  constructor(private readonly clinicService: ClinicsService) {}

  @EventPattern('clinic-added')
  async createClinic(@Payload() dto: CreateClinicDto) {
    console.log('Oh, a clinic: ', dto);
    await this.clinicService.createClinic(dto);
  }
}
