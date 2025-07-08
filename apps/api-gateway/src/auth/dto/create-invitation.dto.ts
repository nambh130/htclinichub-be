import { IsEmail, IsNotEmpty, IsUUID } from "class-validator"

export class CreateInvitationDto{
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsUUID()
  @IsNotEmpty()
  clinic: string

  @IsUUID()
  @IsNotEmpty()
  role: string
}

