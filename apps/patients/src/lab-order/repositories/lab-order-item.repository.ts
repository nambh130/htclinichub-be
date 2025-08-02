import { MongoAbstractRepository } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { LabOrderItem } from "../models/lab-order-item.schema";
import { LabTest } from "../../lab-test/models/lab-test.schema";

type LabOrderItemWithTest = Omit<LabOrderItem, 'labTest'> & {
  labTest: LabTest;
};

@Injectable()
export class LabOrderItemRepository extends MongoAbstractRepository<LabOrderItem> {
  protected readonly logger = new Logger(LabOrderItemRepository.name);

  constructor(
    @InjectModel(LabOrderItem.name, 'patientService')
    readonly labOrderItemModel: Model<LabOrderItem>
  ) {
    super(labOrderItemModel)
  }

  async findOnePopulated(filterQuery: FilterQuery<LabOrderItem>): Promise<LabOrderItemWithTest | null> {
    return this.labOrderItemModel.findOne(filterQuery).populate('labTest') as any;
  }
}

