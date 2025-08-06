import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { ActorType, LabStatusEnum, LabStatusType } from "@app/common";
import { LabTestRepository } from "../lab-test/repositories/lab-test.repoository";
import { LabOrderItemRepository } from "./repositories/lab-order-item.repository";
import { LabOrderRepository } from "./repositories/lab-order.repository";
import { BarcodeCounterService } from "../barcode-counter/barcode-counter.service";
import { BarcodeCounterName } from "../barcode-counter/models/barcode.schema";
import { TestType } from "../lab-test/models/lab-test.schema";
import { TestResultService } from "../lab-test-result/lab-test-result.service";
import { QuantitativeTestResult } from "../lab-test-result/models/quantitative-lab-result.schema";
import { Exception } from "handlebars";
import { ImagingResultData, ImagingTestResult } from "../lab-test-result/models/imaging-test-result.schema";
import { LabOrderItem } from "./models/lab-order-item.schema";

@Injectable()
export class LabOrderService {
  constructor(
    private readonly labOrderRepo: LabOrderRepository,
    private readonly labTestRepo: LabTestRepository,
    private readonly labOrderItemRepo: LabOrderItemRepository,
    private readonly barcodeCounterService: BarcodeCounterService,
    private readonly testResultService: TestResultService
  ) { }

  async createLabOrder(
    data: {
      medicalReportId: Types.ObjectId,
      labTestIds: Types.ObjectId[],
      testType: TestType,
      name: string,
      clinicId: string
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
      status: LabStatusEnum.PENDING,
      createdById: createdBy.userId,
      createdByType: createdBy.userType,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdItems = await this.labOrderItemRepo.createMany(labOrderItems); // or createMany()

    // 3. Create a single LabOrder containing all LabOrderItem IDs
    const labOrder = await this.labOrderRepo.create({
      type: data.testType,
      medicalRecord: new Types.ObjectId(data.medicalReportId),
      orderDate: new Date(),
      name: data.name,
      barCode: await this.barcodeCounterService
        .generateBarcode(BarcodeCounterName.LAB_ORDER, data.clinicId),
      orderItems: createdItems.map(item => item._id),
      createdById: createdBy.userId,
      createdByType: createdBy.userType,
      clinicId: data.clinicId
    });

    return labOrder;
  }

  async getLabOrders(query: { isDone: boolean, orderDate: Date }) {
    return await this.labOrderRepo.labOrderModel
      .find(query).populate('orderItems')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getLabOrdersByReportId(
    {
      medicalReportId,
      type,
      page = 1,
      limit = 10,
    }: {
      medicalReportId: Types.ObjectId,
      type?: TestType,
      page: number,
      limit: number,
    }
  ) {
    const skip = (page - 1) * limit;

    const filter: any = {
      medicalRecord: new Types.ObjectId(medicalReportId),
    };

    if (type) {
      filter.type = type;
    }

    const [data, total] = await Promise.all([
      this.labOrderRepo.labOrderModel
        .find(filter)
        .populate({
          path: 'orderItems',
          populate: {
            path: 'labTest',
            model: 'LabTest',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.labOrderRepo.labOrderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLabOrderItemsForClinic(query: {
    clinicId: string;
    labOrder?: string; // barcode
    medicalRecord?: string;
    testType?: TestType;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      testType,
      clinicId,
      startDate,
      endDate,
      medicalRecord,
      page,
      limit,
      labOrder // barcode
    } = query;

    return this.labOrderRepo.getOrderItemsByClinic({
      clinicId,
      medicalRecord,
      testType,
      limit,
      page,
      endDate,
      startDate,
      barcode: labOrder
    });
  }

  async deleteLabOrder(id: Types.ObjectId) {
    return await this.labOrderRepo.findOneAndDelete(id);
  }

  async getOrderItemById(id: string) {
    return await this.labOrderItemRepo
      .findOnePopulated({ _id: id })
  }

  async updateOrderItemStatus(
    {
      orderItemId,
      status,
      clinicId,
    }:
      {
        orderItemId: string,
        status: LabStatusType,
        clinicId?: string,
      },
    {
      updatedByType,
      updatedById
    }: {
      updatedByType: ActorType,
      updatedById: string
    }
  ) {
    const updateData: Partial<LabOrderItem> = { updatedById, updatedByType, status }
    const item = await this.labOrderItemRepo.findOne({ _id: orderItemId });
    if (!item) {
      throw new BadRequestException("Item not found!");
    }

    if (item.status == LabStatusEnum.PENDING
      && !(status == LabStatusEnum.IN_PROCESS ||
        status == LabStatusEnum.DISPOSED)
    ) { throw new BadRequestException("Invalid state") }

    // Generate barcode if the item is first process
    if (!item.barcode && status == LabStatusEnum.IN_PROCESS) {
      const barcode = await this.barcodeCounterService.generateBarcode(
        BarcodeCounterName.LAB_ORDER_ITEM, clinicId
      )
      updateData.barcode = barcode;
      updateData.sampleTakenAt = new Date();
      updateData.sampleTakenBy = {userId: updatedById, userType: updatedByType};
    }

    //if (status === LabStatusEnum.DISPOSED) {
    //  updateData.sampleTakenAt = null;
    //}

    return await this.labOrderItemRepo.findOneAndUpdate({ _id: orderItemId },
      updateData);
  }

  async rejectOrderItem(
    orderItemId: string,
  ) {
    const item = await this.labOrderItemRepo.findOne({ _id: orderItemId });
    if (!item) {
      throw new BadRequestException("Item not found!");
    }

    return await this.labOrderItemRepo.findOneAndUpdate({ _id: orderItemId },
      { status: LabStatusEnum.DISPOSED });
  }

  async saveQuantitativeResult(
    orderItemId: string,
    result: QuantitativeTestResult["result"],
    actor: { userId: string, userType: ActorType },
    accept?: boolean //just save or save and complete
  ) {
    const orderItem = await this.labOrderItemRepo
      .findOnePopulated({ _id: orderItemId })
    if (!orderItem || orderItem.labTest?.testType != 'LAB') {
      return new BadRequestException()
    }
    const updateResult = await
      this.testResultService.upsertQuantitativeResult({
        orderId: orderItemId, result, actor
      });
    if (!updateResult) {
      throw new Exception('Something gone wrong')
    }
    if (accept) {
      this.updateOrderItemStatus(
        {
          orderItemId,
          status: LabStatusEnum.COLLECTED,
        },
        { updatedByType: actor.userType, updatedById: actor.userId }
      )
    }
    return updateResult
  }

  async saveImagingResult(
    orderItemId: string,
    result: ImagingResultData,
    actor: { userId: string, userType: ActorType },
    accept?: boolean //just save or save and accept
  ): Promise<ImagingTestResult & { deletedImageIds: string[] } | Error> {
    const orderItem = await this.labOrderItemRepo
      .findOnePopulated({ _id: orderItemId })
    if (!orderItem || orderItem.labTest?.testType != 'IMAGING') {
      return new BadRequestException()
    }

    const updateResult = await
      this.testResultService.upsertImagingResult({
        orderId: orderItemId,
        result,
        actor
      });
    if (!updateResult) {
      throw new Exception('Something gone wrong')
    }
    if (accept) {
      this.updateOrderItemStatus(
        {
          orderItemId,
          status: LabStatusEnum.COLLECTED,
        },
        { updatedByType: actor.userType, updatedById: actor.userType }
      )
    }
    return updateResult
  }
}
