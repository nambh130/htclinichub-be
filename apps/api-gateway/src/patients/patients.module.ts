import { Module } from '@nestjs/common';
import { PatientService } from './patients.service';
import { PatientsController } from './patients.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AUTH_CONSUMER_GROUP,
  AUTH_SERVICE,
  PATIENT_CONSUMER_GROUP,
  PATIENT_SERVICE,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PATIENT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'patients',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: PATIENT_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      }
    ]),
    AuthModule
  ],
  controllers: [PatientsController],
  providers: [PatientService, FavouriteDoctorService],
  exports: [PatientService, FavouriteDoctorService],
})
export class PatientsModule {}
