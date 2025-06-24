import { Module } from '@nestjs/common';
import { FavouriteDoctorService } from './favourite_doctor.service';
import { FavouriteDoctorController } from './favourite_doctor.controller';
import { FavouriteDoctorRepository } from './favourite_doctor.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  PATIENTS_TO_STAFF_SERVICE,
  PATIENTS_TO_STAFF_CLIENT,
  PATIENTS_TO_STAFF_CONSUMER
} from '@app/common';

@Module({
  imports: [
    // Ensure ConfigModule is imported so ConfigService can work
    ConfigModule,

    // Register Kafka microservice client
    ClientsModule.registerAsync([
      {
        name: PATIENTS_TO_STAFF_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: PATIENTS_TO_STAFF_CLIENT,
              brokers: [configService.get<string>('KAFKA_BROKER')],
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

    // Register FavouriteDoctor entity for TypeORM
    TypeOrmModule.forFeature([FavouriteDoctor]),
  ],
  controllers: [FavouriteDoctorController],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService, FavouriteDoctorRepository],
})
export class FavouriteDoctorModule {}
