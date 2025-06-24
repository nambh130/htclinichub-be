import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { ConfigModule, ConfigService } from '@nestjs/config';


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
  controllers: [AnalyzeHealthcareDataController],
  providers: [AnalyzeHealthcareDataService]
})
export class AnalyzeHealthcareDataModule {}
