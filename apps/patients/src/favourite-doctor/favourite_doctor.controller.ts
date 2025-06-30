import { Controller, Get, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctorService } from './favourite_doctor.service';

@Controller('favourite-doctor')
export class FavouriteDoctorController {
  constructor(private readonly favouriteDoctorService: FavouriteDoctorService) { }

  @Get('get-favourite-doctors-list/:patientId')
  async getFavouriteDoctorsList(
    @Param('patientId') patientId: string,
  ) {
    try {
      const result = await this.favouriteDoctorService.getFavouriteDoctorsList(patientId);
      return result;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
}