import { MongoAbstractRepository } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LabField } from "../models/lab-field.schema";

@Injectable()
export class LabFieldRepository extends MongoAbstractRepository<LabField> {
  protected readonly logger = new Logger(LabFieldRepository.name);
  constructor(
    @InjectModel(LabField.name, 'patientService')
    readonly labFieldModel: Model<LabField>
  ) {
    super(labFieldModel)
  }
}

