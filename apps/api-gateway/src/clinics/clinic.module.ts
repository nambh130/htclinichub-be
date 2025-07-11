import { Module } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  CLINIC_CONSUMER_GROUP,
  CLINIC_SERVICE,
  STAFF_SERVICE,
} from '@app/common';
import { AuthModule } from '@auth-gw/auth.module';
import { HttpModules, httpClientConfig } from '../api/http.client';

//docker-compose up zookeeper kafka postgres auth staff api-gateway --build --watch
@Module({
  imports: [
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
    // HTTP clients for REST API communication
    HttpModules.registerAsync([
      httpClientConfig(
        STAFF_SERVICE,
        'STAFF_SERVICE_HOST',
        'STAFF_SERVICE_PORT',
      ),
    ]),
    AuthModule,
  ],
  controllers: [ClinicController],
  providers: [ClinicService],
  exports: [ClinicService],
})
export class ClinicModule {}
