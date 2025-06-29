import { ActorType } from "@app/common";
import { ActorEnum } from "@app/common/enum/actor-type";
import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsEnum(ActorEnum)
  actorType: ActorType;

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)
  password: string;
}

