import { IsEmail, MinLength, IsString, Matches } from 'class-validator';

export class InvitationSignupDto {
  @IsString()
  token: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)
  password: string;

  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
