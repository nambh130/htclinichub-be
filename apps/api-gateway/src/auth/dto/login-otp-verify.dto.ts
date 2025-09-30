import { IsString, Matches } from 'class-validator';

export class LoginOtpVerifyDto {
  @IsString()
  @Matches(/^\+?[0-9]\d{1,14}$/, {
    message: 'Invalid phone number',
  })
  phone: string;

  @IsString()
  otp: string;
}
