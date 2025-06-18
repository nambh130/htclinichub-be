import { Module } from '@nestjs/common';
import { ClinicUsersService } from './clinic-users.service';
import { LoggerModule, PostgresDatabaseModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ClinicUser } from './models/clinic-user.entity';
import { ClinicUserRepository } from './clinic-users.repository';
import { ClinicsModule } from '../clinics/clinics.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([ClinicUser]),

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
    ClinicsModule,
    RolesModule
  ],
  providers: [ClinicUsersService, ClinicUserRepository],
  exports: [ClinicUsersService, ClinicUserRepository]
})
export class ClinicUsersModule { }
