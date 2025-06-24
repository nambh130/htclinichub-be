import { Module } from '@nestjs/common';
import { FavouriteDoctorService } from './favourite_doctor.service';
import { FavouriteDoctorController } from './favourite_doctor.controller';
import { FavouriteDoctorRepository } from './favourite_doctor.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { Patient } from '../models/patients.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PATIENTS_STAFF_CONSUMER_GROUP, PATIENTS_STAFF_SERVICE, PATIENTS_TO_STAFF_CLIENT, PATIENTS_TO_STAFF_CONSUMER, PATIENTS_TO_STAFF_SERVICE, STAFF_SERVICE } from '@app/common';

@Module({
  imports: [
    ConfigModule,
    
    // Khởi tạo kết nối đến PostgreSQL (cung cấp DataSource)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: config.get('POSTGRES_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        synchronize: config.get('POSTGRES_SYNC'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Đăng ký entity FavouriteDoctor
    TypeOrmModule.forFeature([FavouriteDoctor]),
  ],

  providers: [FavouriteDoctorRepository],
})
export class FavouriteDoctorModule {}
