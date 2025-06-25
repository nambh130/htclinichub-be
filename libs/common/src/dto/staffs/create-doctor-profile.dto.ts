// doctor-step-one.dto.ts
import {
  IsDateString,
  IsIn,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class DoctorStepOneDto {
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
}
