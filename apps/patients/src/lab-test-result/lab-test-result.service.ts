import { QuantitativeResultRepository } from "./repositories/quantitative-test-result.repository";
import { QuantitativeTestResult } from "./models/quantitative-lab-result.schema";
import { Types } from "mongoose";
import { ImagingResultRepository } from "./repositories/imaging-test-result.repository";
import { ImagingResultData, ImagingTestResult } from "./models/imaging-test-result.schema";
import { Injectable } from "@nestjs/common";

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
    doctorId
  }: {
    orderId: Types.ObjectId;
    result: QuantitativeTestResult["result"];
    doctorId: string;
  }) {
    return this.quantitativeResultRepo.create({
      orderId,
      result,
      takenBy: { doctorId },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateQuantitativeResult(
    id: string,
    updateData: Partial<{
      result: QuantitativeTestResult["result"];
      //doctorId: string;
    }>
  ) {
    const updatePayload: any = {};

    if (updateData.result) {
      updatePayload.result = updateData.result;
    }

    //if (updateData.doctorId) {
    //  updatePayload.takenBy = { doctorId: updateData.doctorId };
    //}

    if (Object.keys(updatePayload).length > 0) {
      updatePayload.updatedAt = new Date();
    }

    return await this.quantitativeResultRepo.updateById(
      id, updatePayload);
  }

  async upsertQuantitativeResult({
    orderId,
    result,
    doctorId,
  }: {
    orderId: Types.ObjectId | string;
    result: QuantitativeTestResult["result"];
    doctorId: string;
  }) {
    const oid = typeof orderId === "string" ? new Types.ObjectId(orderId) : orderId;

    const existing = await this.quantitativeResultRepo.findOne({ orderId: oid });

    if (existing) {
      return this.updateQuantitativeResult(existing._id.toString(), {
        result,
      });
    } else {
      return this.createQuantitativeResult({
        orderId: oid,
        result,
        doctorId,
      });
    }
  }

  async upsertImagingResult({
    orderId,
    result,
    doctorId
  }: {
    orderId: string,
    result: ImagingResultData;
    doctorId: string
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
        result: result
      })
    } else {
      saveResult = await this.createImagingResult({
        orderId: oid,
        result: result,
        doctorId: doctorId
      })
    }
    return { ...saveResult, deletedImageIds }
  }

  async createImagingResult({
    orderId,
    result,
    doctorId,
  }: {
    orderId: Types.ObjectId;
    result: ImagingResultData;
    doctorId: string;
  }) {
    return this.imagingResultRepo.create({
      orderId,
      result,
      takenBy: { doctorId },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateImagingResult(
    id: string,
    payload: Partial<{
      orderId: Types.ObjectId;
      result: ImagingResultData;
      doctorId: string;
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
    if (payload.doctorId) {
      updatePayload.takenBy = { doctorId: payload.doctorId };
    }

    return this.imagingResultRepo.updateById(id, updatePayload);
  }
}
