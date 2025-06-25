import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { StaffModule } from './staff/staff.module';
import { PatientsModule } from './patients/patients.module';
import { AnalyzeHealthcareDataModule } from './analyze-healthcare-data/analyze-healthcare-data.module';
import { ClinicModule } from './clinics/clinic.module';

@Module({
  imports: [
    //Global Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/api-gateway/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.string().required(),
        PORT: Joi.number().default(3000),

        STAFF_SERVICE_HOST: Joi.string(),
        STAFF_SERVICE_PORT: Joi.number(),
      }),
    }),

    //Single imports
    StaffModule,
    PatientsModule,
    AuthModule,
    HttpModule,
    LoggerModule,
    AnalyzeHealthcareDataModule,
    ClinicModule,
  ],
})
export class ApiGatewayModule {}