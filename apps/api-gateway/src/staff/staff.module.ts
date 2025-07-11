import { Module } from '@nestjs/common';
import { DoctorService } from './doctor/doctor.service';
import { DoctorController } from './doctor/doctor.controller';
import { EmployeeService } from './employee/employee.service';
import { EmployeeController } from './employee/employee.controller';
import { AuthModule } from '@auth-gw/auth.module';
import { ConfigModule } from '@nestjs/config';
import { httpClientConfig, HttpModules } from '@api-gateway/api/http.client';
import { STAFF_SERVICE } from '@app/common';
import { MediaModule } from '@media-gw/media.module';
import { ClinicModule } from '@clinics-gw/clinic.module';

@Module({
  imports: [
    ConfigModule,
    HttpModules.registerAsync([
      httpClientConfig(
        STAFF_SERVICE,
        'STAFF_SERVICE_HOST',
        'STAFF_SERVICE_PORT',
      ),
    ]),

    MediaModule,
    AuthModule,
    ClinicModule,
  ],
  controllers: [DoctorController, EmployeeController],
  providers: [DoctorService, EmployeeService],
})
export class StaffModule {}
