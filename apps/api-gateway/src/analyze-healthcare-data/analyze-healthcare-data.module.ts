import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { INPUT_VITAL_SIGNS_CONSUMER_GROUP, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { httpClientConfig } from '../api/http.client';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        httpClientConfig(
          configService.get<string>('VITAL_SERVICE_HOST'),
          configService.get<string>('VITAL_SERVICE_PORT'),
        ),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: INPUT_VITAL_SIGNS_SERVICE,
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
      }
    ]),
    AuthModule
  ],
  controllers: [AnalyzeHealthcareDataController],
  providers: [AnalyzeHealthcareDataService],
  exports: [AnalyzeHealthcareDataService]
})
export class AnalyzeHealthcareDataModule {}
