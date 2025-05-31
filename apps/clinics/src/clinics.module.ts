import { Module } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import {
  DatabaseModule,
  LoggerModule,
  AUTH_SERVICE,
  AUTH_CONSUMER_GROUP,
  CLINIC_SERVICE,
  CLINIC_CONSUMER_GROUP,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicRepository } from './clinic.repository';
import { Clinic, Doctor, EmployeeInfo } from './models';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/clinics/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        MONGODB_URI: Joi.string().required(),
        POSTGRES_URI: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: CLINIC_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'clinic',
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
    TypeOrmModule.forFeature([Clinic, Doctor, EmployeeInfo]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_URI'),
        autoLoadEntities: true,
        synchronize: true, // chỉ dùng cho dev
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ClinicsController],
  providers: [ClinicsService, ClinicRepository],
})
export class ClinicsModule {}
