import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { LoggerModule, PostgresDatabaseModule } from '@app/common';
import { Permission } from './models/permission.entity';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PermissionRepository } from './permissions.repository';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([Permission]),
    LoggerModule,

  ],
  providers: [PermissionsService, PermissionRepository],
  controllers: [PermissionsController],
  exports: [PermissionsService, PermissionRepository]
})
export class PermissionsModule {}
