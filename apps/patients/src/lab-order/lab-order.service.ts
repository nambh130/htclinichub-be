import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { ActorType } from "@app/common";
import { LabTestRepository } from "../lab-test/repositories/lab-test.repoository";
import { LabOrderItemRepository } from "./repositories/lab-order-item.repository";
import { LabOrderRepository } from "./repositories/lab-order.repository";

@Injectable()
export class LabOrderService {
  constructor(
    private readonly labOrderRepo: LabOrderRepository,
    private readonly labTestRepo: LabTestRepository,
    private readonly labOrderItemRepo: LabOrderItemRepository,
  ) { }

  async createLabOrder(
    data: {
      medicalReportId: Types.ObjectId,
      labTestIds: Types.ObjectId[],
      name: string
    },
    createdBy: { userId: string; userType: ActorType }
  ) {
    // 1. Find the lab tests
    const labTests = await this.labTestRepo.find({ _id: { $in: data.labTestIds } });

    if (labTests.length !== data.labTestIds.length) {
      throw new BadRequestException("One or more lab tests not found");
    }

    // 2. Create LabOrderItems for each labTest
    const labOrderItems = labTests.map((labTest) => ({
      labTest: labTest._id,
      price: labTest.price,
      isDone: false,
      status: 'pending',
      createdById: createdBy.userId,
      createdByType: createdBy.userType,
    }));

    const createdItems = await this.labOrderItemRepo.createMany(labOrderItems); // or createMany()
    console.log(createdItems)

    // 3. Create a single LabOrder containing all LabOrderItem IDs
    const labOrder = await this.labOrderRepo.create({
      medicalReport: data.medicalReportId,
      orderDate: new Date(),
      name: data.name,
      orderItems: createdItems.map(item => item._id),
      createdById: createdBy.userId,
      createdByType: createdBy.userType,
    });

    return labOrder;
  }

  async getLabOrders(query: { isDone: boolean, orderDate: Date }) {
    return await this.labOrderRepo.labOrderModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getLabOrdersByReportId(medicalReportId: string) {
    return await this.labOrderRepo.labOrderModel
      .find({ medicalReport: medicalReportId })
      .populate({
        path: 'orderItems',
        populate: {
          path: 'labTest',
          model: 'LabTest', // use exact model name if different
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteLabOrder(id: Types.ObjectId) {
    return await this.labOrderRepo.findOneAndDelete(id);
  }
}
