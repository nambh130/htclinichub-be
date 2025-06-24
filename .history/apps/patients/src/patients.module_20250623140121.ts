import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule, MongoDatabaseModule, PATIENT_SERVICE } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteDoctor, Patient, PatientSchema } from './models';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patients.repository';
import { FavouriteDoctorModule } from './favourite-doctor/favourite_doctor.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DownLoadMedicalReportService } from './medical-report/download_medical_report';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/patients/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_SYNC: Joi.boolean().default(false),
      }),
    }),

    // Database configuration
    // TypeOrmModule.forFeature([Patient]), // Đăng ký Patient entity
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get('POSTGRES_HOST'),
    //     port: configService.get('POSTGRES_PORT'),
    //     username: configService.get('POSTGRES_USER'),
    //     password: configService.get('POSTGRES_PASSWORD'),
    //     database: configService.get('POSTGRES_DB'),
    //     autoLoadEntities: true,
    //     synchronize: true, // Set true để auto tạo tables
    //   }),
    //   inject: [ConfigService],
    // }),

    // Microservices configuration
    ClientsModule.registerAsync([
      {
        name: PATIENT_SERVICE,
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

    MongoDatabaseModule,
    MongoDatabaseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
    ]),

    // Feature modules
    // FavouriteDoctorModule,
    // LoggerModule,
  ],
  // controllers: [PatientsController],
  // providers: [PatientsService, PatientRepository, DownLoadMedicalReportService],
  // exports: [PatientsService, PatientRepository],

  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule { }
