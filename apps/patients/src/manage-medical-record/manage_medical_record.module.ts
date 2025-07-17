import { Module } from '@nestjs/common';
import {
  MongoDatabaseModule,
  LoggerModule,
  PATIENTS_TO_STAFF_SERVICE,
  PATIENTS_TO_STAFF_CLIENT,
  PATIENTS_TO_STAFF_CONSUMER,
} from '@app/common';
import { ManageMedicalRecordController } from './manage_medical_record.controller';
import { ManageMedicalRecordService } from './manage_medical_record.service';
import { MedicalReportRepository } from './manage_medical_record.repository';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from '../models/medical_record.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PatientsModule } from '../patients.module';
import { PatientRepository } from '../patients.repository';
import { Patient, PatientSchema } from '../models';

@Module({
  imports: [
    LoggerModule,
    MongoDatabaseModule.forFeature(
      [
        {
          name: MedicalRecord.name,
          schema: MedicalRecordSchema,
        },
        { name: Patient.name, schema: PatientSchema },
      ],
      'patientService',
    ), // ✅ Dùng connectionName giống Patient

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

  controllers: [ManageMedicalRecordController],
  providers: [
    ManageMedicalRecordService,
    MedicalReportRepository,
    PatientRepository,
  ],
  exports: [ManageMedicalRecordService, MedicalReportRepository],
})
export class ManageMedicalRecordModule {}
