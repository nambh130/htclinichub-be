import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patients.repository';

import { Patient, PatientSchema } from './models/patient.schema';
import { MongoDatabaseModule } from '@app/common';

import { FavouriteDoctorModule } from './favourite-doctor/favourite_doctor.module';
import { LoggerModule, PATIENT_SERVICE } from '@app/common';
import * as Joi from 'joi';


@Module({
  imports: [
    // Load env variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/patients/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),

    }),

    // Kết nối MongoDB với Patient schema
    MongoDatabaseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
    ]),

    // Dùng FavouriteDoctorService từ PostgreSQL
    FavouriteDoctorModule, // ✅ rất quan trọng

    // Logger nếu bạn dùng
    LoggerModule,

    // Kafka client (nếu cần)

 





@Module({
  imports: [
    FavouriteDoctorModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/patients/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    })
  ],
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule { }
