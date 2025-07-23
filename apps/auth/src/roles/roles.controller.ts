import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { GetRoleDto } from './dto/get-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { In } from 'typeorm';
import { ActorEnum } from '@app/common/enum/actor-type';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  @Delete()
  delete(@Body() deleteRoleDto: DeleteRoleDto) {
    return this.roleService.deleteRole(deleteRoleDto.id);
  }

  @Get()
  find(@Query() getRoleDto: GetRoleDto) {
    return this.roleService.getRole(getRoleDto);
  }

  @Get('clinic')
  getAllClinicRoles() {
    console.log('Hello');
    return this.roleService.getAll({
      roleType: In([ActorEnum.DOCTOR, ActorEnum.EMPLOYEE]),
    });
  }
}
