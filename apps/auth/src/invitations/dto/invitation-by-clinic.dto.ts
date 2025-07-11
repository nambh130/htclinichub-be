import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';
import { InvitationEnum } from '../models/invitation.entity';

export class InvitationByClinicDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  clinicId: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsEnum(InvitationEnum)
  status?: InvitationEnum;

  @IsOptional()
  @IsString()
  invitedById?: string;

  @IsOptional()
  @IsString()
  createdAfter?: string;

  @IsOptional()
  @IsString()
  createdBefore?: string;

  @IsOptional()
  @IsString()
  expiresBefore?: string; // ISO date string

  @IsOptional()
  @IsString()
  expiresAfter?: string;
}
