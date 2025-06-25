import { IsString, IsBoolean } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  token: string

  @IsBoolean()
  accept: boolean
}

