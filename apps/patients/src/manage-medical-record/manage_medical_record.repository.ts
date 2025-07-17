import { Injectable, Logger } from '@nestjs/common';
import {MedicalRecord } from '../models/medical_record.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoAbstractRepository } from '@app/common';

@Injectable()
export class MedicalReportRepository extends MongoAbstractRepository<MedicalRecord> {
  protected readonly logger = new Logger(MedicalReportRepository.name);

  constructor(
  @InjectModel(MedicalRecord.name, 'patientService') // ✅ Dùng đúng tên connection
    MedicalRecordModel: Model<MedicalRecord>,
  ) {
    super(MedicalRecordModel);
  }
}