import { Body, Controller, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ClinicService } from './clinic.service';

@Controller()
export class ClinicEventController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post('clinic-created')
  async create(@Body() payload: any) {
    const newClinic = {
      name: payload.name,
      location: payload.location,
    };
    return await this.clinicService.createClinic(newClinic);
  }

  //khanh
  @EventPattern('clinic-added')
  async handleClinicCreated(@Payload() payload: any) {
    const newClinic = {
      id: payload.id,
      name: payload.name,
      location: payload.location,
      phone: payload.phone,
      email: payload.email,
      ownerId: payload.ownerId,
      token: payload.token,
      createdById: payload.createdById,
    };
    console.log(' [StaffService] Received event clinic-added:', payload);
    return await this.clinicService.addClinic(newClinic);
  }
}
