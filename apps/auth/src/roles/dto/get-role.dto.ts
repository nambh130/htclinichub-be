import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { FindOptionsWhere } from 'typeorm';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';
import { Role } from '../models/role.entity';

export class GetRoleDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Object)
  where: FindOptionsWhere<Role>;
}
