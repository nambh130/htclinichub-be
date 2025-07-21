import { MongoAbstractRepository } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LabOrder } from "../models/lab-order.schema";

@Injectable()
export class LabOrderRepository extends MongoAbstractRepository<LabOrder> {
  protected readonly logger = new Logger(LabOrderRepository.name);

  constructor(
    @InjectModel(LabOrder.name, 'patientService')
    readonly labOrderModel: Model<LabOrder>
  ) {
    super(labOrderModel)
  }
}
