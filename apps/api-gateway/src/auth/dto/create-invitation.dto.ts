import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"

export class CreateInvitationDto{
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsUUID()
  @IsNotEmpty()
  clinic: string

  @IsOptional()
  @IsString()
  clinicName?: string

  @IsUUID()
  @IsNotEmpty()
  role: string
}

