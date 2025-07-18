import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoAbstractRepository } from '@app/common';
import { PrescriptionDetail, PrescriptionDetailDocument } from '../models/prescription_detail.schema';

@Injectable()
export class PrescriptionRepository extends MongoAbstractRepository<PrescriptionDetailDocument> {
  protected readonly logger = new Logger(PrescriptionRepository.name);

  constructor(
    @InjectModel(PrescriptionDetail.name, 'patientService')
    patientModel: Model<PrescriptionDetailDocument>,
  ) {
    super(patientModel);
  }

    async createPrescription(document: Partial<PrescriptionDetail>): Promise<PrescriptionDetail> {
      this.logger.debug(`Creating document: ${JSON.stringify(document)}`);
      const createdDocument = new this.model({
        ...document,
        _id: new Types.ObjectId(),
      });
      return (await createdDocument.save()).toJSON() as PrescriptionDetail;
    }
}