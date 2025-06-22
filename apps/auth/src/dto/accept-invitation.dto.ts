import { IsEmail, IsString, IsBoolean } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  token: string

  @IsEmail()
  email: string;

  @IsBoolean()
  accept: boolean
}

