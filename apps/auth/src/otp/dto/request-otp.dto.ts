import { IsString, Matches } from "class-validator";

export class RequestOtpDto {
  @IsString()
  phone: string;
}

