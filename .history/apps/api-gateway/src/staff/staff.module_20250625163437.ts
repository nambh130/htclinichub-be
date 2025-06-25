import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AuthModule } from '../auth/auth.module';
import { ManageDoctorScheduleService } from './manage-doctor-schedule/manage-doctor-schedule.service';
//docker-compose up zookeeper kafka postgres auth staff api-gateway --build --watch

import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { httpClientConfig } from '../api/http.client';

>>>>>>> dev
@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        httpClientConfig(
          configService.get<string>('STAFF_SERVICE_HOST'),
          configService.get<string>('STAFF_SERVICE_PORT'),
        ),
      inject: [ConfigService],
    }),

    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, ManageDoctorScheduleService],
  exports: [StaffService, ManageDoctorScheduleService],
})
export class StaffModule { }
