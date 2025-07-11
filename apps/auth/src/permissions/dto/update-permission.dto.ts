import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permisison.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
