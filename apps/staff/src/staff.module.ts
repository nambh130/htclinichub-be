import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule, PostgresDatabaseModule } from '@app/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './models/doctor.entity';
import { EmployeeInfo } from './models/employeeInfo.entity';
import { Degree } from './models/degree.entity';
import { Specialize } from './models/specialize.entity';
import { DoctorServiceLink } from './models/doctorServiceLinks.entity';
import { Employee } from './models/employee.entity';
import { EmployeeRoleLink } from './models/employeeRoleLinks.entity';
import { Image } from './models/image.entity';
import { Invitation } from './models/invitation.entity';
import { Role } from './models/role.entity';
import { Service } from './models/service.entity';
import { DoctorRepository } from './repositories/doctor.repository';

@Module({
  imports: [
    // Global configuration module with environment variables validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/staff/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_SYNC: Joi.boolean().default(false),
      }),
    }),

    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([
      Doctor,
      EmployeeInfo,
      Degree,
      Specialize,
      DoctorServiceLink,
      Employee,
      EmployeeRoleLink,
      Image,
      Invitation,
      Role,
      Service,
    ]),

    //Single imports
    LoggerModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, DoctorRepository],
  exports: [StaffService, TypeOrmModule],
})
export class StaffModule {}
