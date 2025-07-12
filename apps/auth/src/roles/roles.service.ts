// role.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@app/common';
import { Role } from './models/role.entity';
import { RoleRepository } from './roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRoleDto } from './dto/get-role.dto';
import { PermissionRepository } from '../permissions/permissions.repository';
import { FindOptionsWhere, In } from 'typeorm';

@Injectable()
export class RolesService extends BaseService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {
    super();
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...rest } = createRoleDto;
    const permissions = await this.permissionRepository.find({
      id: In(permissionIds),
    });
    console.log('pers: ', permissions);

    const role = new Role({ ...rest, permissions });
    return await this.roleRepository.create(role);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...rest } = updateRoleDto;

    const role = await this.roleRepository.findOne({ id }, ['permissions']);

    if (!role) throw new NotFoundException('Role not found');

    if (permissionIds) {
      const permissions = await this.permissionRepository.find({
        id: In(permissionIds),
      });
      role.permissions = permissions;
    }

    Object.assign(role, rest);
    console.log(role);
    return await this.roleRepository.create(role);
  }

  async deleteRole(id: string) {
    return await this.roleRepository.findOneAndDelete({ id });
  }

  async getRole(getRoleDto: GetRoleDto) {
    const { page, limit, where } = getRoleDto;
    const take = limit;
    const skip = (page - 1) * take;

    const [data, total] = await this.roleRepository.findAndCount(
      where,
      skip,
      take,
      ['permissions'],
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getAll(filter: FindOptionsWhere<Role>) {
    return this.roleRepository.find({ ...filter });
  }

  async getById(id: string) {
    return this.roleRepository.findOne({ id });
  }
}
