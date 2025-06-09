import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctorService } from './favourite_doctor.service';

@Controller()
export class FavouriteDoctorController {
  constructor(private readonly favouriteDoctorService: FavouriteDoctorService) {}

  @MessagePattern('get-favourite-doctors-list')
  async getFavouriteDoctorsList(@Payload() data: { userId: string }) {
    console.log('Received userId:', data.userId);
    return this.favouriteDoctorService.getFavouriteDoctorsList(data);
  }
}