import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActorEnum } from '../clinic-users/models/clinic-user.entity';
import { ActorType } from '@app/common';

export class ClinicUserLoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(ActorEnum)
  userType: ActorType
}
