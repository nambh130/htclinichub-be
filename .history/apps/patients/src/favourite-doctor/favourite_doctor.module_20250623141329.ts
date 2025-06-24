import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FavouriteDoctor } from "../models";
import { FavouriteDoctorService } from "./favourite_doctor.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([FavouriteDoctor]),
  ],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService, FavouriteDoctorRepository],
})
export class FavouriteDoctorModule {}
