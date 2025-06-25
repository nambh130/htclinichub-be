import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageDoctorScheduleService } from './manage-doctor-schedule.service';
import { ManageDoctorScheduleRepository } from './manage-doctor-schedule.repository';
import { Doctor_WorkShift } from '../../models/doctor_workshift.entity';
import { DoctorModule } from '../doctor.module'; // ✅ import để dùng DoctorRepository
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [

  ConfigModule,

        // Chỉ kết nối PostgreSQL cho module này
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

    TypeOrmModule.forFeature([Doctor_WorkShift]),
    DoctorModule,
  ],
    controllers: [DoctorController],
  
  providers: [
    ManageDoctorScheduleService,
    ManageDoctorScheduleRepository,
  ],
  exports: [
    ManageDoctorScheduleService,
    ManageDoctorScheduleRepository,
  ],
})
export class ManageDoctorScheduleModule {}
