import { Body, Controller, Post } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ClinicService } from './clinic.service';
import { ClinicOwnerAdded } from '@app/common/events/auth/clinic-owner-added.event';
import { DoctorService } from '../doctor/doctor.service';

@Controller()
export class ClinicEventController {
  constructor(
    private readonly clinicService: ClinicService,
    private readonly doctorService: DoctorService
  ) { }

  @Post('clinic-created')
  async create(@Body() payload: any) {
    const newClinic = {
      name: payload.name,
      location: payload.location,
    };
    return await this.clinicService.createClinic(newClinic);
  }

  //khanh
  @MessagePattern('clinic-added')
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

  @EventPattern('clinic-owner-added')
  async handleOwnerAdded(@Payload() payload: ClinicOwnerAdded) {
    const { ownerId, clinicId } = payload;
    console.log(ownerId)
    const owner = await this.doctorService.getDoctorById(ownerId)
    const clinic = await this.clinicService.getClinicById(clinicId);
    clinic.owner = owner;
    await this.clinicService.save(clinic);
  }
}
