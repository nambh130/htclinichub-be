import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { RoleEnum, RoleType } from '../models/role.entity';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];

  @IsEnum(RoleEnum)
  roleType: RoleType;
}
