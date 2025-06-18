import { IsNotEmpty, IsString, Matches } from "class-validator";

export class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  otp: string
}


