import {
  IsDateString,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDoctorProfileDto {
  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsDateString()
  dob: Date;

  @IsPhoneNumber('VN') // or 'ZZ' for any country
  phone: string;

  @IsString()
  gender: string;

  @IsString()
  position: string;
}
