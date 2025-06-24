import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { INPUT_VITAL_SIGNS_SERVICE, LoggerModule, MongoDatabaseModule } from '@app/common';
import { Vitals, VitalsSchema } from '../models';
import { ClientsModule, Transport } from '@nestjs/microservices';


@Module({
   imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: './apps/analyze-healthcare-data/.env',
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
          name: Vitals.name,
          schema: VitalsSchema,
        },
      ]),
  
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

    ],
  controllers: [AnalyzeHealthcareDataController],
  providers: [AnalyzeHealthcareDataService]
})
export class AnalyzeHealthcareDataModule {}
