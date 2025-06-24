// apps/patients/patients.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient, PatientSchema } from './models';
import { MongoDatabaseModule, LoggerModule, PATIENT_SERVICE } from '@app/common';
import * as Joi from 'joi';
import { FavouriteDoctorModule } from './favourite-doctor/favourite_doctor.module';
import { PatientRepository } from './patients.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/patients/.env',
      validationSchema: Joi.object({
         KAFKA_BROKER: Joi.required(),
        MONGODB_URI: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_SYNC: Joi.boolean().default(false),
      }),
    }),

    LoggerModule,

    // Kết nối Mongo
    MongoDatabaseModule,
    MongoDatabaseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
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
              brokers: [configService.get<string>('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'patients-consumer',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    // Import Postgre module con
    FavouriteDoctorModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
   exports: [
    PatientsService,
    PatientRepository, 
  ],
})
export class PatientsModule {}
