import { Module } from '@nestjs/common';
import { ClinicUsersService } from './clinic-users.service';
import { LoggerModule, PostgresDatabaseModule } from '@app/common';
import * as Joi from 'joi';
import { User } from './models/clinic-user.entity';
import { ClinicUserRepository } from './clinic-users.repository';
import { ClinicsModule } from '../clinics/clinics.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([User]),

    LoggerModule,
    ClinicsModule,
    RolesModule
  ],
  providers: [ClinicUsersService, ClinicUserRepository],
  exports: [ClinicUsersService, ClinicUserRepository]
})
export class ClinicUsersModule { }
