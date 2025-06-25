import { LoggerModule, PostgresDatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { Role } from './models/role.entity';
import { ConfigModule } from '@nestjs/config';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import * as Joi from 'joi';
import { RoleRepository } from './roles.repository';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([Role]),
    LoggerModule,

    PermissionsModule
  ],
  providers: [RolesService, RoleRepository],
  controllers: [RolesController],
  exports: [RolesService, RoleRepository]
})
export class RolesModule {
}
