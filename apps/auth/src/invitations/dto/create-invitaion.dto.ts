import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsUUID } from "class-validator"

export class CreateInvitationDto{
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsUUID()
  @IsNotEmpty()
  clinic: string

  @IsUUID()
  @IsOptional()
  role: string

  @IsBoolean()
  isOwnerInvitation: boolean
}
