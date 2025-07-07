import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { StaffModule } from './staff/staff.module';
import { PatientsModule } from './patients/patients.module';
import { AnalyzeHealthcareDataModule } from './analyze-healthcare-data/analyze-healthcare-data.module';
import { MediaModule } from './media/media.module';
import { ClinicModule } from './clinics/clinic.module';

@Module({
  imports: [
    //Global Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.string().required(),
        API_GATEWAY_PORT: Joi.number().required(),

        AUTH_SERVICE_URL: Joi.string().required(),

        STAFF_SERVICE_HOST: Joi.string().required(),
        STAFF_SERVICE_PORT: Joi.number().required(),

        MEDIA_SERVICE_HOST: Joi.string().required(),
        MEDIA_SERVICE_PORT: Joi.number().required(),

        PATIENT_SERVICE_HOST: Joi.string().required(),
        PATIENT_SERVICE_PORT: Joi.number().required(),
      }),
    }),

    //Single imports
    StaffModule,
    PatientsModule,
    AuthModule,
    AnalyzeHealthcareDataModule,
    LoggerModule,
    MediaModule,
    ClinicModule,
  ],
})
export class ApiGatewayModule {}
