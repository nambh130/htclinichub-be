import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import {
  MongoDatabaseModule,
  LoggerModule,
  AUTH_SERVICE,
  RESERVATIONS_SERVICE,
  RESERVATIONS_CONSUMER_GROUP,
  AUTH_CONSUMER_GROUP,
  PostgresDatabaseModule,
} from '@app/common';
import { ReservationsRepository } from './reservations.repository';
import { ReservationDocument, ReservationSchema } from './models';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Reservation } from './models/reservation.entity';
import { ReservationsPostgresRepository } from './reservations.postgres.repository';

@Module({
  imports: [
    //Mongo
    MongoDatabaseModule,
    MongoDatabaseModule.forFeature([
      { name: ReservationDocument.name, schema: ReservationSchema },
    ]),

    //PostgreSQL
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([Reservation]),

    //The rest
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/reservations/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        MONGODB_URI: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        // Synchronize should only use in development, not in production
        POSTGRES_SYNC: Joi.boolean().default(false),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: RESERVATIONS_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'reservations',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: RESERVATIONS_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      },
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
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationsRepository,
    ReservationsPostgresRepository,
  ],
})
export class ReservationsModule {}
