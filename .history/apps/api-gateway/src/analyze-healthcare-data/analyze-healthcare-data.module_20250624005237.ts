import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { INPUT_VITAL_SIGNS_CONSUMER_GROUP, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

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
              clientId: 'Input Vital Signs',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: INPUT_VITAL_SIGNS_CONSUMER_GROUP,
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
export class AnalyzeHealthcareDataModule { }
