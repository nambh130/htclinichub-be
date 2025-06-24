import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';

@Module({



@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PATIENT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'patients',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: PATIENT_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      }
    ]),
    AuthModule
  ],
 




  controllers: [AnalyzeHealthcareDataController],
  providers: [AnalyzeHealthcareDataService],
  exports: [AnalyzeHealthcareDataService]
})
export class AnalyzeHealthcareDataModule {}
