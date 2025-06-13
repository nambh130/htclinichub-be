import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClinicUserLoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;


}

