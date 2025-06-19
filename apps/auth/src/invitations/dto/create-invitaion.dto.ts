import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator"
import { ActorEnum, ActorType } from "../../clinic-users/models/clinic-user.entity"

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

  @IsEnum(ActorEnum)
  userType: ActorType

  @IsBoolean()
  isOwnerInvitation: boolean
}
