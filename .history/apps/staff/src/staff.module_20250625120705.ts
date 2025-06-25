import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from '@app/common';
import { DoctorModule } from './doctor/doctor.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './models/doctor.entity';
import { EmployeeInfo } from './models/employeeInfo.entity';
import { Doctor_WorkShift } from './models/doctor_workshift.entity';

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

    // TypeORM configuration for PostgreSQL
    TypeOrmModule.forFeature([Doctor, EmployeeInfo, Doctor_WorkShift]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        database: configService.get('POSTGRES_DB'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        autoLoadEntities: true,
        synchronize: true, // chỉ dùng cho dev
      }),
      inject: [ConfigService],
    }),

    // MongoDB configuration
    //to be continued with MongoDB configuration if needed

    //Single imports
    DoctorModule,
    LoggerModule,
    ManageDoctorScheduleModule
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
