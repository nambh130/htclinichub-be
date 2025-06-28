import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { httpClientConfig, HttpModules } from '../api/http.client';
import { MEDIA_SERVICE, STAFF_SERVICE } from '@app/common';
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

    MediaModule,
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService,ManageDoctorScheduleService],
})
export class StaffModule {}