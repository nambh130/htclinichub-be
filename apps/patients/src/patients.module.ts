// apps/patients/patients.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import {
  FavouriteDoctor,
  Patient,
  PatientAccount,
  PatientSchema,
} from './models';
import {
  MongoDatabaseModule,
  LoggerModule,
  PATIENT_SERVICE,
  PostgresDatabaseModule,
  PATIENTS_TO_STAFF_SERVICE,
  PATIENTS_TO_STAFF_CLIENT,
  PATIENTS_TO_STAFF_CONSUMER,
  CLINIC_SERVICE,
} from '@app/common';
import * as Joi from 'joi';
import { FavouriteDoctorModule } from './favourite-doctor/favourite_doctor.module';
import { PatientRepository } from './patients.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
import { FavouriteDoctorRepository } from './favourite-doctor/favourite_doctor.repository';
import { FavouriteDoctorController } from './favourite-doctor/favourite_doctor.controller';
import { PatientClinicLink } from './models/patient_clinic_link.entity';
import { PatientAccountRepository } from './repositories/patient-account.repositoty';
import { PatientClinicLinkRepository } from './repositories/patient-clinic-link.repository';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://clinics:3007',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        PATIENT_SERVICE_URI: Joi.string().required(),
      }),
    }),

    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRES_IN')}s`,
        },
      }),
      inject: [ConfigService],
    }),

    LoggerModule,
    MongoDatabaseModule.forRoot({
      envKey: 'PATIENT_SERVICE_URI',
      connectionName: 'patientService',
    }),
    MongoDatabaseModule.forFeature(
      [
        {
          name: Patient.name,
          schema: PatientSchema,
        },
      ],
      'patientService',
    ),

    PostgresDatabaseModule.register('PATIENT_SERVICE_DB'),
    PostgresDatabaseModule.forFeature([
      FavouriteDoctor,
      PatientAccount,
      PatientClinicLink,
    ]),

    ClientsModule.registerAsync([
      {
        name: PATIENT_SERVICE, // tương ứng 'patients'
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'patients-client',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: 'patients-consumer',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    ClientsModule.registerAsync([
      {
        name: PATIENTS_TO_STAFF_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: PATIENTS_TO_STAFF_CLIENT,
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: PATIENTS_TO_STAFF_CONSUMER,
              allowAutoTopicCreation: true,
            },
            subscribe: {
              fromBeginning: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    // Import Postgre module con
    FavouriteDoctorModule,
  ],
  controllers: [PatientsController, FavouriteDoctorController],
  providers: [
    PatientsService,
    PatientRepository,
    FavouriteDoctorService,
    FavouriteDoctorRepository,
    JwtModule,
    PatientAccountRepository,
    PatientClinicLinkRepository,
    {
      provide: CLINIC_SERVICE,
      useExisting: HttpService,
    },
  ],
  exports: [
    PatientsService,
    PatientRepository,
    FavouriteDoctorService,
    FavouriteDoctorRepository,
    PatientAccountRepository,
    PatientClinicLinkRepository,
  ],
})
export class PatientsModule {}
