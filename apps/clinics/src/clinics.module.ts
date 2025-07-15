import { forwardRef, Module } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import {
  LoggerModule,
  CLINIC_SERVICE,
  CLINIC_CONSUMER_GROUP,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicRepository } from './clinic.repository';
import { Clinic, Medicine } from './models';
import { ClinicEventController } from './clinic-event.controller';
import { ClinicScheduleRuleRepository } from './clinic_schedule_rule/clinic_schedule_rule.repository';
import { ClinicScheduleRuleModule } from './clinic_schedule_rule/clinic_schedule_rule.module';
import { ClinicScheduleRule } from './models/clinic_schedule_rule.entity';
import { MedicineModule } from './medicine/medicine.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        // CLINIC_SERVICE_URI: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        CLINIC_SERVICE_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        // Synchronize should only use in development, not in production
        POSTGRES_SYNC: Joi.boolean().default(false),
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
    ]),

    // TypeORM configuration for PostgreSQL
    TypeOrmModule.forFeature([Clinic, ClinicScheduleRule, Medicine]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('CLINIC_SERVICE_DB'),
        autoLoadEntities: true,
        synchronize: true, // chỉ dùng cho dev
      }),
      inject: [ConfigService],
    }),

    // MongoDB configuration
    forwardRef(() => ClinicScheduleRuleModule),
    forwardRef(() => MedicineModule), // Sử dụng forwardRef,
  ],
  controllers: [ClinicsController, ClinicEventController],
  providers: [ClinicsService, ClinicRepository],
  exports: [ClinicsService, ClinicRepository],
})
export class ClinicsModule { }
