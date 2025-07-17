import { Module } from '@nestjs/common';
import { DoctorService } from './doctor/doctor.service';
import { DoctorController } from './doctor/doctor.controller';
import { EmployeeService } from './employee/employee.service';
import { EmployeeController } from './employee/employee.controller';
import { AuthModule } from '@auth-gw/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { httpClientConfig, HttpModules } from '@api-gateway/api/http.client';
import {
  AUTH_CONSUMER_GROUP,
  AUTH_SERVICE,
  MEDIA_SERVICE,
  STAFF_CONSUMER_GROUP,
  STAFF_SERVICE,
} from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MediaModule } from '@media-gw/media.module';
import { ManageDoctorScheduleService } from './manage-doctor-schedule/manage-doctor-schedule.service';
import { ClinicModule } from '@clinics-gw/clinic.module';
import { MedicineController } from './medicine/medicine.controller';
import { MedicineService } from './medicine/medicine.service';

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
              brokers: [configService.get('KAFKA_BROKER')],
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
              brokers: [configService.get('KAFKA_BROKER')],
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
    ClinicModule,
  ],
  controllers: [DoctorController, EmployeeController, MedicineController],
  providers: [
    DoctorService,
    EmployeeService,
    ManageDoctorScheduleService,
    MedicineService,
  ],
  exports: [
    DoctorService,
    EmployeeService,
    ManageDoctorScheduleService,
    MedicineService,
  ],
})
export class StaffModule {}
