import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patients.repository';

import { Patient, PatientSchema } from './models/patient.schema';
import { MongoDatabaseModule } from '@app/common';

import { FavouriteDoctorModule } from './favourite-doctor/favourite_doctor.module';
import { LoggerModule, PATIENT_SERVICE } from '@app/common';

@Module({
  imports: [
    // Load env variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/patients/.env',
    }),

    // Kết nối MongoDB với Patient schema
    MongoDatabaseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
    ]),

    // Dùng FavouriteDoctorService từ PostgreSQL
    FavouriteDoctorModule, // ✅ rất quan trọng

    // Logger nếu bạn dùng
    LoggerModule,

    // Kafka client (nếu cần)
    ClientsModule.registerAsync([
      {
        name: PATIENT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'patients-client',
              brokers: [configService.get('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'patients-consumer',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule {}
