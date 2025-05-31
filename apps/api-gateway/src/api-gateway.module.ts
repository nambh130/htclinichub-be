import { Module } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { ApiGatewayController } from './api-gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AUTH_CONSUMER_GROUP,
  AUTH_SERVICE,
  CLINIC_CONSUMER_GROUP,
  CLINIC_SERVICE,
  LoggerModule,
  RESERVATIONS_CONSUMER_GROUP,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/api-gateway/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.string().required(),
        PORT: Joi.number().default(3000),
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
        name: CLINIC_SERVICE, 
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'clinics',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: CLINIC_CONSUMER_GROUP,
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
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
