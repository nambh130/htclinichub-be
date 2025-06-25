import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageDoctorScheduleService } from './manage-doctor-schedule.service';
import { ManageDoctorScheduleRepository } from './manage-doctor-schedule.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  PATIENTS_TO_STAFF_CLIENT,
  PATIENTS_TO_STAFF_CONSUMER,
  PATIENTS_TO_STAFF_SERVICE,
} from '@app/common';
import { Doctor_WorkShift } from '../../models/doctor_workshift.entity';
import { Doctor } from '../../models/doctor.entity';
import { DoctorRepository } from '../doctor.repository';

@Module({
  imports: [
    ConfigModule,

    // Kết nối PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // Đăng ký entity sử dụng
    TypeOrmModule.forFeature([Doctor_WorkShift, Doctor]),
  ],

  providers: [
    ManageDoctorScheduleService,
    ManageDoctorScheduleRepository,
    DoctorRepository, // nếu Doctor dùng custom repository
  ],
  exports: [
    ManageDoctorScheduleService,
    ManageDoctorScheduleRepository,
    DoctorRepository,
  ],
})
export class ManageDoctorScheduleModule {}
