import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([FavouriteDoctor]),
  ],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService, FavouriteDoctorRepository],
})
export class FavouriteDoctorModule {}
