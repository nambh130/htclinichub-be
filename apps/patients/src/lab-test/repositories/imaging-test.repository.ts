import { MongoAbstractRepository } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ImagingTest } from "../models/lab-test.schema";

@Injectable()
export class ImagingTestRepository extends MongoAbstractRepository<ImagingTest> {
  protected readonly logger = new Logger(ImagingTestRepository.name);
  constructor(
    @InjectModel(ImagingTest.name, 'patientService')
    readonly imagingTestModel: Model<ImagingTest>
  ) {
    super(imagingTestModel)
  }
}
