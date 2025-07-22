import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeAccount {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsUUID()
  roleId: string;
}


