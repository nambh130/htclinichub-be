import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { DeletePermissionDto } from './dto/delete-permission.dto';
import { Permission } from './models/permission.entity';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionDto } from './dto/get-permisison.dto';
import { CreatePermissionDto } from './dto/create-permisison.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPermissionDto: CreatePermissionDto
  ): Promise<Permission> {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() getPermissionDto: GetPermissionDto
  ): Promise<{
    data: Permission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { data, total, page, limit } =
      await this.permissionsService.getPermission(getPermissionDto);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param() deletePermissionDto: DeletePermissionDto
  ): Promise<void> {
    await this.permissionsService.deletePermission(deletePermissionDto);
  }
}
