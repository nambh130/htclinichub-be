import { Module } from '@nestjs/common';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { FavouriteDoctorService } from './favourite_doctor.service';
import { FavouriteDoctorRepository } from './favourite_doctor.repository';
import { PostgresDatabaseModule } from '../database/postgres-database.module'; // đường dẫn tùy bạn

@Module({
  imports: [
    PostgresDatabaseModule.forFeature([FavouriteDoctor]), // ✅ dùng đúng cách
  ],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService, FavouriteDoctorRepository],
})
export class FavouriteDoctorModule {}
