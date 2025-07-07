// doctor-step-one.dto.ts
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class DoctorProfileDto {
  @IsString()
  @IsIn(['doctor', 'employee'])
  type: string;

  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsDateString()
  dob: Date;

  @IsPhoneNumber('VN')
  phone: string;

  @IsString()
  gender: string;

  @IsString()
  position: string;

  @IsString()
  @IsOptional()
  profile_img_id?: string;
}

export class UpdateProfileDto {
  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsDateString()
  dob: Date;

  @IsPhoneNumber('VN')
  phone: string;

  @IsString()
  gender: string;

  @IsString()
  position: string;

  @IsString()
  @IsOptional()
  profile_img_id?: string;
}
