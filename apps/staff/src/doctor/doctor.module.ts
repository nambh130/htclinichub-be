import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorRepository } from '../repositories/doctor.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../models/doctor.entity';
import { StaffInfo } from '../models/staffInfo.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Doctor_WorkShift } from '../models/doctor_workshift.entity';
import {
  PATIENTS_TO_STAFF_CLIENT,
  PATIENTS_TO_STAFF_CONSUMER,
  PATIENTS_TO_STAFF_SERVICE,
} from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PATIENTS_TO_STAFF_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: PATIENTS_TO_STAFF_CLIENT,
              brokers: [configService.get('KAFKA_BROKER')],
            },
            consumer: {
              groupId: PATIENTS_TO_STAFF_CONSUMER,
              allowAutoTopicCreation: true,
            },
            subscribe: {
              fromBeginning: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    TypeOrmModule.forFeature([Doctor, StaffInfo, Doctor_WorkShift]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
  exports: [DoctorService, DoctorRepository],
})
export class DoctorModule {}
