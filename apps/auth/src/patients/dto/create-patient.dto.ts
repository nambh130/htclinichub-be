import { IsOptional, IsString, Matches } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number',
  })
  phone: string;

  @IsOptional()
  @IsString()
  password: string;
}
