import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patients.repository';

import { Patient, PatientSchema } from './models';
import { MongoDatabaseModule } from '@app/common';

import { FavouriteDoctorModule } from './favourite-doctor/favourite_doctor.module';
import { LoggerModule, PATIENT_SERVICE } from '@app/common';
import * as Joi from 'joi';

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
    }),

    MongoDatabaseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
    ]),

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
  ],
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule { }
