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
    forwardRef(() => ClinicUsersModule),
  ],
  providers: [ClinicsService, ClinicRepository],
  exports: [ClinicsService, ClinicRepository],
})
export class ClinicsModule {}
