import { ManageMedicalRecordModule } from './../manage-medical-record/manage_medical_record.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrescriptionDetail, PrescriptionDetailSchema } from '../models/prescription_detail.schema';
import { PrescriptionService } from './prescription_detail.service';
import { PrescriptionRepository } from './prescription_detail.repository';
import { PatientsModule } from '../patients.module';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                { name: PrescriptionDetail.name, schema: PrescriptionDetailSchema },
            ],
            'patientService',
        ),
        ManageMedicalRecordModule,
        forwardRef(() => PatientsModule),
    ],
    providers: [PrescriptionService, PrescriptionRepository],
    exports: [PrescriptionService, PrescriptionRepository],
})
export class PrescriptionModule {}
