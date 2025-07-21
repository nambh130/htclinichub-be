import { MongoAbstractRepository } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LabOrderItem } from "../models/lab-order-item.schema";

@Injectable()
export class LabOrderItemRepository extends MongoAbstractRepository<LabOrderItem> {
  protected readonly logger = new Logger(LabOrderItemRepository.name);

  constructor(
    @InjectModel(LabOrderItem.name, 'patientService')
    readonly labOrderItemModel: Model<LabOrderItem>
  ) {
    super(labOrderItemModel)
  }
}

