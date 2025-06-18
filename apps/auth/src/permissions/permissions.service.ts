import { BaseService } from '@app/common';
import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './permissions.repository';
import { CreatePermissionDto } from './dto/create-permisison.dto';
import { Permission } from './models/permission.entity';
import { DeletePermissionDto } from './dto/delete-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionDto } from './dto/get-permisison.dto';

@Injectable()
export class PermissionsService extends BaseService {
  constructor(
    private readonly permissionRepository: PermissionRepository
  ) { super(); }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const newPermission = new Permission(createPermissionDto);
    return await this.permissionRepository.create(newPermission);
  }

  async deletePermission(deletePermissionDto: DeletePermissionDto) {
    return await this.permissionRepository.findOneAndDelete({ id: deletePermissionDto.id });
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    return await this.permissionRepository.findOneAndUpdate({
      id
    }, updatePermissionDto);
  }

  async getPermission(getPermissionDto: GetPermissionDto) {
    const { page, limit, where } = getPermissionDto;
    const take = limit;
    const skip = (page - 1) * take;

    const [data, total] = await this.permissionRepository.findAndCount(
      where,
      skip,
      take,
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
