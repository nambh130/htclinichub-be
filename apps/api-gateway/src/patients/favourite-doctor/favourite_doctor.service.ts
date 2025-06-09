import {
  AUTH_SERVICE,
  FavouriteDoctorDto,
  PATIENT_SERVICE,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FavouriteDoctorService implements OnModuleInit {
  constructor(
    @Inject(PATIENT_SERVICE)
    private readonly patientClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) { }

  async onModuleInit() {
    this.patientClient.subscribeToResponseOf('add-favourite-doctors');
    this.patientClient.subscribeToResponseOf('get-favourite-doctors-list');

    this.authClient.subscribeToResponseOf('authenticate');

    await this.patientClient.connect();
    await this.authClient.connect();
  }

  // Patient-related methods

  async addFavouriteDoctor(
    userId: string,
    favouriteDoctorDto: FavouriteDoctorDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.patientClient.send('add-favourite-doctors', { userId, favouriteDoctorDto })
      );
      // return {
      //   "Patient update successfully Patient Services": result,
      // };
      return result;
    } catch (error) {
      console.error('Error add doctor:', error);
      throw error;
    }
  }

  async getFavouriteDoctors(userId: string) {
  return await firstValueFrom(
    this.patientClient.send('get-favourite-doctors-list', { userId })
  );
}
}
