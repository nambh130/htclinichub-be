import { LoggerModule, PostgresDatabaseModule } from '@app/common';
import { forwardRef, Module } from '@nestjs/common';
import { Clinic } from './models/clinic.entity';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { ClinicsService } from './clinics.service';
import { ClinicRepository } from './clinics.repository';
import { ClinicUsersModule } from '../clinic-users/clinic-users.module';

@Module({
  imports: [
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([Clinic]),

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
    forwardRef(() => ClinicUsersModule)
  ],
  providers: [ClinicsService, ClinicRepository],
  exports: [ClinicsService, ClinicRepository]
})
export class ClinicsModule { }
