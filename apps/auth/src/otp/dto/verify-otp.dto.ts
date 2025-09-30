import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
