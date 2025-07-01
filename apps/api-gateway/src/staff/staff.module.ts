import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { httpClientConfig, HttpModules } from '../api/http.client';
import { AUTH_CONSUMER_GROUP, AUTH_SERVICE, MEDIA_SERVICE, STAFF_CONSUMER_GROUP, STAFF_SERVICE } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MediaModule } from '../media/media.module';
import { ManageDoctorScheduleService } from './manage-doctor-schedule/manage-doctor-schedule.service';

@Module({
  imports: [
    ConfigModule,
    HttpModules.registerAsync([
      httpClientConfig(
        STAFF_SERVICE,
        'STAFF_SERVICE_HOST',
        'STAFF_SERVICE_PORT',
      ),
      httpClientConfig(
        MEDIA_SERVICE,
        'MEDIA_SERVICE_HOST',
        'MEDIA_SERVICE_PORT',
      ),
    ]),
    ClientsModule.registerAsync([
      {
        name: STAFF_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'staff',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: STAFF_CONSUMER_GROUP,
            },
          },
        }),
      },
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: AUTH_CONSUMER_GROUP,
            },
          },
        }),
      },
    ]),
    MediaModule,
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, ManageDoctorScheduleService],
  exports: [StaffService, ManageDoctorScheduleService],
})
export class StaffModule { }
