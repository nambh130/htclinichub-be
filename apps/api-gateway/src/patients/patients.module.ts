import { Module } from '@nestjs/common';
import { PatientService } from './patients.service';
import { PatientsController } from './patients.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AUTH_CONSUMER_GROUP,
  AUTH_SERVICE,
  PATIENT_CONSUMER_GROUP,
  PATIENT_SERVICE,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
import { HttpModule } from '@nestjs/axios';
import { httpClientConfig, HttpModules } from '../api/http.client';
import { ManageMedicalRecordService } from './manage-medical-record/manage_medical_record.service';

@Module({
  imports: [
    ConfigModule,
    // HttpModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) =>
    //     httpClientConfig(
    //       configService.get<string>('PATIENT_SERVICE_HOST'),
    //       configService.get<string>('PATIENT_SERVICE_PORT'),
    //     ),
    //   inject: [ConfigService],

    HttpModules.registerAsync([
      httpClientConfig(
        PATIENT_SERVICE,
        'PATIENT_SERVICE_HOST',
        'PATIENT_SERVICE_PORT',
      ),
    ]),

    ClientsModule.registerAsync([
      {
        name: PATIENT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'patient',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: PATIENT_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: AUTH_CONSUMER_GROUP,
            },
          },
        }),
      },
    ]),
    AuthModule
  ],
  controllers: [PatientsController],
  providers: [PatientService, FavouriteDoctorService, ManageMedicalRecordService],
  exports: [PatientService, FavouriteDoctorService, ManageMedicalRecordService],
})
export class PatientsModule { }
