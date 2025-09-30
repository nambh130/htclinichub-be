import { ActorType } from '@app/common';
import { ActorEnum } from '@app/common/enum/actor-type';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class PasswordRecoveryDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsEnum(ActorEnum)
  actorType: ActorType;
}
