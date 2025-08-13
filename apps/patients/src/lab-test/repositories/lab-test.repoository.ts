import { MongoAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LabTest } from '../models/lab-test.schema';

@Injectable()
export class LabTestRepository extends MongoAbstractRepository<LabTest> {
  protected readonly logger = new Logger(LabTestRepository.name);
  constructor(
    @InjectModel(LabTest.name, 'patientService')
    readonly labTestModel: Model<LabTest>,
  ) {
    super(labTestModel);
  }
}
