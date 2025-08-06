import { QuantitativeResultRepository } from "./repositories/quantitative-test-result.repository";
import { QuantitativeTestResult } from "./models/quantitative-lab-result.schema";
import { Types } from "mongoose";
import { ImagingResultRepository } from "./repositories/imaging-test-result.repository";
import { ImagingResultData, ImagingTestResult } from "./models/imaging-test-result.schema";
import { Injectable } from "@nestjs/common";
import { ActorType } from "@app/common";

@Injectable()
export class TestResultService {
  constructor(
    private readonly quantitativeResultRepo: QuantitativeResultRepository,
    private readonly imagingResultRepo: ImagingResultRepository,
  ) { }

  async findQuantitativeResultByOrder(orderId: string) {
    return await this.quantitativeResultRepo.findOne({ orderId: new Types.ObjectId(orderId) });
  }

  async findImagingResultByOrder(orderId: string) {
    return await this.imagingResultRepo.findByOrderId(new Types.ObjectId(orderId));
  }

  async createQuantitativeResult({
    orderId,
    result,
    createdBy,
  }: {
    orderId: Types.ObjectId;
    result: QuantitativeTestResult["result"];
    createdBy: { userId: string, userType: ActorType },
  }) {
    return this.quantitativeResultRepo.create({
      orderId,
      result,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateQuantitativeResult(
    id: string,
    updateData: Partial<{
      result: QuantitativeTestResult["result"];
      updatedBy: {
        userId: string;
        userType: ActorType;
      }
    }>
  ) {
    const updatePayload: any = {};

    const { result, updatedBy } = updateData;

    if (result) updatePayload.result = result;
    if (updatedBy?.userId && updatedBy?.userType) updatePayload.updatedBy = updatedBy;

    if (Object.keys(updatePayload).length > 0) {
      updatePayload.updatedAt = new Date();
    }

    return await this.quantitativeResultRepo.updateById(
      id, updatePayload);
  }

  async upsertQuantitativeResult({
    orderId,
    result,
    actor
  }: {
    orderId: Types.ObjectId | string;
    result: QuantitativeTestResult["result"];
    actor: { userId: string; userType: ActorType };
  }) {
    const oid = typeof orderId === "string" ? new Types.ObjectId(orderId) : orderId;

    const existing = await this.quantitativeResultRepo.findOne({ orderId: oid });

    if (existing) {
      return this.updateQuantitativeResult(existing._id.toString(), {
        result,
        updatedBy: actor,
      });
    } else {
      return this.createQuantitativeResult({
        orderId: oid,
        result,
        createdBy: actor,
      });
    }
  }

  async upsertImagingResult({
    orderId,
    result,
    actor
  }: {
    orderId: string,
    result: ImagingResultData;
    actor: { userId: string; userType: ActorType };
  }) {
    const oid = typeof orderId === "string" ? new Types.ObjectId(orderId) : orderId;
    const existing = await this.imagingResultRepo.findByOrderId(oid);

    let deletedImageIds: string[] = []
    let saveResult: ImagingTestResult
    if (existing) {
      // Get deleted images
      if (existing.result.images.length > 0 && result.images.length > 0) {
        const newImageIds = result.images.map(item => item.id)
        deletedImageIds = existing.result.images
          .filter(image => !newImageIds.includes(image.id))
          .map(image => image.id);

      }

      saveResult = await this.updateImagingResult(existing._id.toString(), {
        result: result, updatedBy: actor
      })
    } else {
      saveResult = await this.createImagingResult({
        orderId: oid,
        result: result,
        createdBy: actor,
      })
    }
    return { ...saveResult, deletedImageIds }
  }

  async createImagingResult({
    orderId,
    result,
    createdBy,
  }: {
    orderId: Types.ObjectId;
    result: ImagingResultData;
    createdBy: { userId: string; userType: ActorType };
  }) {
    return this.imagingResultRepo.create({
      orderId,
      result,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateImagingResult(
    id: string,
    payload: Partial<{
      orderId: Types.ObjectId;
      result: ImagingResultData;
      updatedBy: { userId: string; userType: ActorType };
    }>
  ) {
    const updatePayload: any = {
      updatedAt: new Date(),
    };

    if (payload.orderId) {
      updatePayload.orderId = payload.orderId;
    }
    if (payload.result) {
      updatePayload.result = payload.result;
    }
    if (payload.updatedBy) {
      updatePayload.updatedBy = payload.updatedBy;
    }

    return this.imagingResultRepo.updateById(id, updatePayload);
  }

}
