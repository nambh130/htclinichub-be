import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';
import { ActorEnum } from '../models/clinic-user.entity';
import { ActorType } from '@app/common';
import { Optional } from '@nestjs/common';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)
  password: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  @IsUUID()
  clinic: string;

  @IsEnum(ActorEnum)
  actorType: ActorType;

}
