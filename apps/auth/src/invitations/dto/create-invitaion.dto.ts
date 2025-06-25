import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ActorEnum } from '../../clinic-users/models/clinic-user.entity';
import { ActorType } from '@app/common';

export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUUID()
  @IsNotEmpty()
  clinic: string;

  @IsUUID()
  @IsOptional()
  role: string;

  @IsEnum(ActorEnum)
  userType: ActorType;

  @IsBoolean()
  isOwnerInvitation: boolean;
}
