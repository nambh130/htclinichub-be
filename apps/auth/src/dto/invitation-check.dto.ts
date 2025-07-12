import { IsEmail, IsString } from 'class-validator';

export class InvitationCheckDto {
  @IsString()
  token: string;

  @IsEmail()
  email: string;
}
