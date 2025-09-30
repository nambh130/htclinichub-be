import {
  IsDateString,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class EmployeeProfileDto {
  @IsString()
  @IsIn(['doctor', 'employee'])
  type: string;

  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  @Matches(/^\d{9}(\d{3})?$/, {
    message: 'social_id must be 9 or 12 digits',
  })
  social_id?: string;

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
