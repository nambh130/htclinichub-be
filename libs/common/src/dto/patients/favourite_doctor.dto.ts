import { IsNotEmpty, IsNumber } from 'class-validator';

export class FavouriteDoctorDto {
  @IsNotEmpty()
  doctor_id: string;
}