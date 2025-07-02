import { Module } from '@nestjs/common';
import { DoctorService } from './doctor/doctor.service';
import { DoctorController } from './doctor/doctor.controller';
import { EmployeeService } from './employee/employee.service';
import { EmployeeController } from './employee/employee.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { httpClientConfig, HttpModules } from '../api/http.client';
import { MEDIA_SERVICE, STAFF_SERVICE } from '@app/common';
import { MediaModule } from '../media/media.module';

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
  controllers: [DoctorController, EmployeeController],
  providers: [DoctorService, EmployeeService],
})
export class StaffModule {}
