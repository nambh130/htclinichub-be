import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([FavouriteDoctor]),
  ],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService, FavouriteDoctorRepository],
})
export class FavouriteDoctorModule {}
