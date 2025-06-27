import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { LoggerModule, PostgresDatabaseModule } from '@app/common';

import { Degree } from './models/degree.entity';
import { Doctor } from './models/doctor.entity';
import { DoctorServiceLink } from './models/doctorServiceLinks.entity';
import { Employee } from './models/employee.entity';
import { EmployeeRoleLink } from './models/employeeRoleLinks.entity';
import { Image } from './models/image.entity';
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
import { DoctorEventController } from './doctor/doctor-event.controller';
import { EmployeeEventController } from './employee/employee-event.controller';
import { DoctorClinicMap } from './models/doctor-clinic-map.entity';
import { Clinic } from './models/clinic.entity';
import { ClinicEventController } from './clinic/clinic-event.controller';
import { ClinicRepository } from './clinic/clinic.repository';
import { ClinicService } from './clinic/clinic.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/staff/.env',
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().default(3003),
        KAFKA_BROKER: Joi.required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_SYNC: Joi.boolean().default(false),
      }),
    }),
    LoggerModule,
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([
      Degree,
      Doctor,
      DoctorServiceLink,
      Employee,
      EmployeeRoleLink,
      Image,
      Invitation,
      Role,
      Service,
      Specialize,
      StaffInfo,
      DoctorClinicMap,
      Clinic
    ]),
  ],
  controllers: [StaffController, DoctorController,
    EmployeeController,
    DoctorEventController,
    EmployeeEventController,
    ClinicEventController
  ],
  providers: [
    StaffService,
    DoctorService,
    EmployeeService,
    ClinicService,
    CommonRepository,
    DoctorRepository,
    EmployeeRepository,
    StaffInfoRepository,
    ClinicRepository
    
  ],
  exports: [StaffService],
})
export class StaffModule {}
