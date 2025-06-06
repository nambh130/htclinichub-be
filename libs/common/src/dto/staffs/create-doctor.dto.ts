// create-doctor.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class CreateDoctorAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
