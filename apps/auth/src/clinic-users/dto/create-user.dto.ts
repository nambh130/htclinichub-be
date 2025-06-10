import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserType } from '../../interfaces/token-payload.interface';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsString()
  @MinLength(6)
  password: string;
}
