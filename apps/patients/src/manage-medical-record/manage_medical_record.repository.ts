import { Injectable, Logger } from '@nestjs/common';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MongoAbstractRepository } from '@app/common';
import { ManageMedicalRecord } from '../models/manage_medical_record.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ManageMedicalReportRepository extends MongoAbstractRepository<ManageMedicalRecord> {
  protected readonly logger = new Logger(ManageMedicalReportRepository.name);

  constructor(
  @InjectModel(ManageMedicalRecord.name, 'patientService') // ✅ Dùng đúng tên connection
    manageMedicalRecordModel: Model<ManageMedicalRecord>,
  ) {
    super(manageMedicalRecordModel);
  }
}