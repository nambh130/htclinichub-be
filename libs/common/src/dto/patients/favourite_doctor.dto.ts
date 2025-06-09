import { IsNumber } from 'class-validator';

export class FavouriteDoctorDto {
  @IsNumber()
  doctor_id: number;
}