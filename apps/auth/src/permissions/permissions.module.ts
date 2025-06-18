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

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        // Synchronize should only use in development, not in production
        POSTGRES_SYNC: Joi.boolean().default(false),
      }),
    }),
  ],
  providers: [PermissionsService, PermissionRepository],
  controllers: [PermissionsController],
  exports: [PermissionsService, PermissionRepository]
})
export class PermissionsModule {}
