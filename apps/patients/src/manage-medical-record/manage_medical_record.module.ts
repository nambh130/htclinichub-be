import { Module } from '@nestjs/common';
import { MongoDatabaseModule, LoggerModule, PATIENTS_TO_STAFF_SERVICE, PATIENTS_TO_STAFF_CLIENT, PATIENTS_TO_STAFF_CONSUMER } from '@app/common';
import { ManageMedicalRecordController } from './manage_medical_record.controller';
import { ManageMedicalRecordService } from './manage_medical_record.service';
import { ManageMedicalReportRepository } from './manage_medical_record.repository';
import { ManageMedicalRecord, ManageMedicalRecordSchema } from '../models/manage_medical_record.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        LoggerModule,

        MongoDatabaseModule.forFeature([
            {
                name: ManageMedicalRecord.name,
                schema: ManageMedicalRecordSchema,
            },
        ], 'patientService'), // ✅ Dùng connectionName giống Patient

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
    providers: [ManageMedicalRecordService, ManageMedicalReportRepository],
    exports: [ManageMedicalRecordService, ManageMedicalReportRepository],
})
export class ManageMedicalRecordModule { }
