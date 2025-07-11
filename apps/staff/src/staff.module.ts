import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { LoggerModule, PostgresDatabaseModule } from '@app/common';

import { Degree } from './models/degree.entity';
import { Doctor } from './models/doctor.entity';
import { DoctorServiceLink } from './models/doctorServiceLinks.entity';
import { Employee } from './models/employee.entity';
import { EmployeeRoleLink } from './models/employeeRoleLinks.entity';
import { Invitation } from './models/invitation.entity';
import { Role } from './models/role.entity';
import { Service } from './models/service.entity';
import { Specialize } from './models/specialize.entity';
import { StaffInfo } from './models/staffInfo.entity';

import { DoctorController } from './doctor/doctor.controller';
import { DoctorService } from './doctor/doctor.service';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeService } from './employee/employee.service';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

import { CommonRepository } from './repositories/common.repository';
import { DoctorRepository } from './repositories/doctor.repository';
import { EmployeeRepository } from './repositories/employee.repository';
import { StaffInfoRepository } from './repositories/staffInfo.repository';
import { DegreeRepository } from './repositories/degree.repository';
import { SpecializeRepository } from './repositories/specialize.repository';
import { DoctorEventController } from './doctor/doctor-event.controller';
import { EmployeeEventController } from './employee/employee-event.controller';
import { DoctorClinicMap } from './models/doctor-clinic-map.entity';
import { Clinic } from './models/clinic.entity';
import { ClinicEventController } from './clinic/clinic-event.controller';
import { ClinicRepository } from './clinic/clinic.repository';
import { ClinicService } from './clinic/clinic.service';
import { DoctorClinicRepo } from './repositories/doctor-clinic-map.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        STAFF_SERVICE_PORT: Joi.number().required(),
        KAFKA_BROKER: Joi.required(),

        STAFF_SERVICE_DB: Joi.string().required(),

        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_SYNC: Joi.boolean().required(),
      }),
    }),
    LoggerModule,
    PostgresDatabaseModule.register('STAFF_SERVICE_DB'),
    PostgresDatabaseModule.forFeature([
      Degree,
      Doctor,
      DoctorServiceLink,
      Employee,
      EmployeeRoleLink,
      Invitation,
      Role,
      Service,
      Specialize,
      StaffInfo,
      DoctorClinicMap,
      Clinic,
    ]),
  ],
  controllers: [
    DoctorController,
    EmployeeController,
    StaffController,
    DoctorEventController,
    EmployeeEventController,
    ClinicEventController,
  ],
  providers: [
    DoctorService,
    DegreeRepository,
    SpecializeRepository,
    EmployeeService,
    StaffService,
    ClinicService,
    CommonRepository,
    DoctorRepository,
    EmployeeRepository,
    StaffInfoRepository,
    ClinicRepository,
    DoctorClinicRepo,
  ],
  exports: [],
})
export class StaffModule {}
