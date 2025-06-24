import { AnalyzeHealthcareDataController } from './../../.history/apps/analyze-healthcare-data/analyze-healthcare-data.controller_20250624001549';
import { Injectable, Logger } from '@nestjs/common';
import { Patient, PatientDocument } from './models';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MongoAbstractRepository, PostgresAbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
@Injectable()
export class AnalyzeHealthcareDataRepository extends MongoAbstractRepository<Vi> {
  protected readonly logger = new Logger(PatientRepository.name);

  constructor(
    @InjectModel(Patient.name)
    patientModel: Model<PatientDocument>,
  ) {
    super(patientModel);
  }

  async findByPhone(phone: string) {
    const existPhone = await this.model.findOne({ phone });
    if (!existPhone) {
      return null;
    }
    return existPhone;
  }
