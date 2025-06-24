import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { ClientsModule } from '@nestjs/microservices';
import { INPUT_VITAL_SIGNS_SERVICE } from '@app/common';

@Module({




  imports: [
    ClientsModule.registerAsync([
      {
        name: INPUT_VITAL_SIGNS_SERVICE,
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
