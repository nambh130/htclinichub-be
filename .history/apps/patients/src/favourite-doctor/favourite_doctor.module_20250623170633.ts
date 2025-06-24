import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { FavouriteDoctorService } from './favourite_doctor.service';
import { FavouriteDoctorRepository } from './favourite_doctor.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PATIENTS_TO_STAFF_CLIENT, PATIENTS_TO_STAFF_SERVICE } from '@app/common';

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
        synchronize: config.get<boolean>('POSTGRES_SYNC'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

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
                            allowAutoTopicCreation: true
                        },
                        subscribe: {
                            fromBeginning: true
                        }
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    // Đăng ký entity cần dùng
    TypeOrmModule.forFeature([FavouriteDoctor]),
  ],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService, FavouriteDoctorRepository], // để PatientsModule dùng
})
export class FavouriteDoctorModule {}
