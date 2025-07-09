import { forwardRef, Module } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CLINIC_CONSUMER_GROUP, CLINIC_SERVICE } from '@app/common';
import { AuthModule } from '../auth/auth.module';
import { httpClientConfig, HttpModules } from '../api/http.client';
import { ClinicScheduleRuleApiService } from './clinic-schedule-rule/clinic-schedule-rule.service';
//docker-compose up zookeeper kafka postgres auth staff api-gateway --build --watch
@Module({
  imports: [
    HttpModules.registerAsync([
      httpClientConfig(
        'CLINIC_HTTP_SERVICE',
        'CLINIC_SERVICE_HOST',
        'CLINIC_SERVICE_PORT',
      ),
    ]),
    // Microservices clients for Kafka communication
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
    forwardRef(() => AuthModule),
  ],
  controllers: [ClinicController],
  providers: [ClinicService, ClinicScheduleRuleApiService],
  exports: [ClinicService, ClinicScheduleRuleApiService],
})
export class ClinicModule {}
