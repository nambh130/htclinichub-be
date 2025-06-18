import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { FindOptionsWhere } from 'typeorm';
import { PaginationQueryDto } from '@app/common/dto/pagination.dto';
import { Permission } from '../models/permission.entity';

export class GetPermissionDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Object)
  where: FindOptionsWhere<Permission>;
}
