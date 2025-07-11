import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { INPUT_VITAL_SIGNS_CONSUMER_GROUP, INPUT_VITAL_SIGNS_SERVICE, LoggerModule, MongoDatabaseModule } from '@app/common';
import { Vitals, VitalsSchema } from '../models';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnalyzeHealthcareDataRepository } from './analyze-healthcare-data.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
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

    // Kết nối Mongo
    MongoDatabaseModule.forRoot({
      envKey: 'PATIENT_SERVICE_URI',
      connectionName: 'patientService',
    }), MongoDatabaseModule.forFeature([
      {
        name: Vitals.name,
        schema: VitalsSchema,
      },
    ], 'patientService'),

    ClientsModule.registerAsync([
      {
        name: INPUT_VITAL_SIGNS_SERVICE, // tương ứng 'patients'
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'analyze-healthcare-data',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: INPUT_VITAL_SIGNS_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AnalyzeHealthcareDataModule,
  ],
  controllers: [AnalyzeHealthcareDataController],
  providers: [AnalyzeHealthcareDataService, AnalyzeHealthcareDataRepository],
  exports: [AnalyzeHealthcareDataService, AnalyzeHealthcareDataRepository]
})
export class AnalyzeHealthcareDataModule { }
