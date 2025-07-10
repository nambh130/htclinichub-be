import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { FavouriteDoctorService } from './favourite_doctor.service';
import { FavouriteDoctorRepository } from './favourite_doctor.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import {
  PATIENTS_TO_STAFF_CLIENT,
  PATIENTS_TO_STAFF_CONSUMER,
  PATIENTS_TO_STAFF_SERVICE,
} from '@app/common';

@Module({
  imports: [
    ConfigModule,

    // KHÔNG CẦN forRootAsync nữa

    // Chỉ cần forFeature nếu đã cấu hình connection ở nơi khác
    TypeOrmModule.forFeature([FavouriteDoctor]),

    ClientsModule.registerAsync([
      {
        name: PATIENTS_TO_STAFF_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: PATIENTS_TO_STAFF_CLIENT,
              brokers: [configService.get('KAFKA_BROKER')!],
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
  ],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService, FavouriteDoctorRepository],
})
export class FavouriteDoctorModule {}
