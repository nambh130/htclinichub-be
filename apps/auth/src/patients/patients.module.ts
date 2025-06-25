import {
  AUTH_CONSUMER_GROUP,
  AUTH_SERVICE,
  PostgresDatabaseModule,
  RESERVATIONS_CONSUMER_GROUP,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { Module } from '@nestjs/common';
import { Patient } from './models/patient.entity';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patients.repository';

@Module({
  imports: [
    //PostgreSQL
    PostgresDatabaseModule.register('AUTH_SERVICE_DB'),
    PostgresDatabaseModule.forFeature([Patient]),

    LoggerModule,

    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
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
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [PatientsService, PatientRepository],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule {}
