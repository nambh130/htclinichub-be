import {
  AUTH_SERVICE,
  FavouriteDoctorDto,
  PATIENT_SERVICE,
  TokenPayload,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FavouriteDoctorService {
  constructor(private readonly httpService: HttpService) { }
  // Patient-related methods
  async addFavouriteDoctor(
    user: TokenPayload,
    favouriteDoctorDto: FavouriteDoctorDto,
  ) {
    try {

      const userId = user.userId;
      const payload = { userId, favouriteDoctorDto };

      const result = await firstValueFrom(
        this.httpService.post('/patient-service/add-favourite-doctors', payload)
      );

      return result.data;
    } catch (error) {
      console.error('Error add doctor:', error);
      throw error;
    }
  }

  async getFavouriteDoctors(user: TokenPayload, patientId: string) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/favourite-doctor/get-favourite-doctors-list/${patientId}`)
      );
      return result.data;

    } catch (error) {
      console.error('Error add doctor:', error);
      throw error;
    }
  }
}
