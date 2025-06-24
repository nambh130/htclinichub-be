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

            TypeOrmModule.forFeature([FavouriteDoctor]),

            TypeOrmModule.forRootAsync({
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: configService.get<number>('POSTGRES_PORT'),
                    username: configService.get('POSTGRES_USER'),
                    password: configService.get('POSTGRES_PASSWORD'),
                    database: configService.get('POSTGRES_DB'),
                    autoLoadEntities: true,
                    synchronize: configService.get<boolean>('POSTGRES_SYNC') || false,
        ]),
        TypeOrmModule.forFeature([FavouriteDoctor])
    ],
    controllers: [FavouriteDoctorController],
    providers: [FavouriteDoctorService, FavouriteDoctorRepository],
    exports: [FavouriteDoctorService, FavouriteDoctorRepository],
})
export class FavouriteDoctorModule { }
