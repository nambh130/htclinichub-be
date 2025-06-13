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
    PermissionsModule
  ],
  providers: [RolesService, RoleRepository],
  controllers: [RolesController],
  exports: [RolesService, RoleRepository]
})
export class RolesModule {
}
