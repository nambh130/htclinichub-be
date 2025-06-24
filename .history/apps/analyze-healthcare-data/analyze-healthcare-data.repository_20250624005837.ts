import { AnalyzeHealthcareDataController } from './../../.history/apps/analyze-healthcare-data/analyze-healthcare-data.controller_20250624001549';
import { Injectable, Logger } from '@nestjs/common';
import { VitalsDocument } from './models';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MongoAbstractRepository, PostgresAbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
@Injectable()
export class AnalyzeHealthcareDataRepository extends MongoAbstractRepository<VitalsDocument> {
  protected readonly logger = new Logger(AnalyzeHealthcareDataRepository.name);

  constructor(
    @InjectModel(Vi.name)
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
