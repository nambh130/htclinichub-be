import { MongoAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuantitativeTest } from '../models/lab-test.schema';

@Injectable()
export class QuantitativeTestRepository extends MongoAbstractRepository<QuantitativeTest> {
  protected readonly logger = new Logger(QuantitativeTestRepository.name);
  constructor(
    @InjectModel(QuantitativeTest.name, 'patientService')
    readonly quantitativeTestModel: Model<QuantitativeTest>,
  ) {
    super(quantitativeTestModel);
  }
}
