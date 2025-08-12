import { QuantitativeResultRepository } from "./repositories/quantitative-test-result.repository";
import { QuantitativeTestResult } from "./models/quantitative-lab-result.schema";
import { Types } from "mongoose";
import { ImagingResultRepository } from "./repositories/imaging-test-result.repository";
import { ImagingResultData } from "./models/imaging-test-result.schema";
import { Injectable } from "@nestjs/common";
import { ActorType } from "@app/common";
import { LabTestResult } from "./models/lab-result.schema";
import { LabTestResultRepository } from "./repositories/test-result.respository";

@Injectable()
export class TestResultService {
  constructor(
    private readonly quantitativeResultRepo: QuantitativeResultRepository,
    private readonly imagingResultRepo: ImagingResultRepository,
    private readonly resultRepo: LabTestResultRepository,
  ) { }

  async findQuantitativeResultByOrder(orderId: string) {
    return await this.quantitativeResultRepo.findOne({ orderId: new Types.ObjectId(orderId) });
  }

  async findImagingResultByOrder(orderId: string) {
    return await this.imagingResultRepo.findByOrderId(new Types.ObjectId(orderId));
  }

  async findManyQuantResultByOrderItems(ids: Types.ObjectId[]) {
    return await this.quantitativeResultRepo.find({
      orderId: { $in: ids },
    });
  }


  async createQuantitativeResult({
    orderId,
    result,
    createdBy,
    uploadedResult
  }: {
    orderId: Types.ObjectId;
    result?: QuantitativeTestResult["result"];
    createdBy: { userId: string, userType: ActorType },
    uploadedResult?: LabTestResult["uploadedResult"];
  }) {
    return this.quantitativeResultRepo.create({
      orderId,
      result,
      createdBy,
      uploadedResult,
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
      },
      uploadedResult?: LabTestResult["uploadedResult"];
    }>
  ) {
    const updatePayload: Partial<QuantitativeTestResult> = {};
    const { result, updatedBy, uploadedResult } = updateData;

    if (result) updatePayload.result = result;
    if (updatedBy?.userId && updatedBy?.userType) updatePayload.updatedBy = updatedBy;
    if (uploadedResult?.length) updatePayload.uploadedResult = uploadedResult;

    if (Object.keys(updatePayload).length === 0) return null;

    updatePayload.updatedAt = new Date();

    return await this.quantitativeResultRepo.updateById(id, updatePayload);
  }

  async upsertQuantitativeResult({
    orderId,
    result,
    uploadedResult,
    actor
  }: {
    orderId: Types.ObjectId | string;
    result?: QuantitativeTestResult["result"];
    uploadedResult?: LabTestResult["uploadedResult"];
    actor: { userId: string; userType: ActorType };
  }) {
    const oid = typeof orderId === "string" ? new Types.ObjectId(orderId) : orderId;

    const existing = await this.quantitativeResultRepo.findOne({ orderId: oid });
    const deletedResultFiles = this.getDeletedUploadedFileIds(existing?.uploadedResult, uploadedResult);

    const savedResult = existing ?
      await this.updateQuantitativeResult(existing._id.toString(), {
        result,
        updatedBy: actor,
        uploadedResult
      }) :
      await this.createQuantitativeResult({
        orderId: oid,
        result,
        createdBy: actor,
        uploadedResult
      })

    return { ...savedResult, deletedResultFiles }
  }

  async addResultFile({
    orderItemId,
    resultFile
  }: {
    orderItemId: string,
    resultFile: LabTestResult["uploadedResult"][number]
  }) {
    console.log('check: ', orderItemId, resultFile)
    return this.resultRepo.updateByOrderId(
      orderItemId,
      { $push: { uploadedResult: resultFile } }
    );
  }

  async removeResultFile({
    orderItemId,
    resultFileId
  }: {
    orderItemId: string,
    resultFileId: string
  }) {
    return this.resultRepo.updateByOrderId(
      orderItemId,
      { $pull: { uploadedResult: { id: resultFileId } } }
    );
  }

  async upsertImagingResult({
    orderId,
    result,
    actor,
    uploadedResult
  }: {
    orderId: string,
    result?: ImagingResultData;
    actor: { userId: string; userType: ActorType };
    uploadedResult?: LabTestResult["uploadedResult"];
  }) {
    const oid = typeof orderId === "string" ? new Types.ObjectId(orderId) : orderId;

    const existing = await this.imagingResultRepo.findByOrderId(oid);

    const deletedImageIds = this.getDeletedImageIds(existing?.result?.images, result?.images);
    const deletedResultFiles = this.getDeletedUploadedFileIds(existing?.uploadedResult, uploadedResult);

    const savedResult = existing
      ? await this.updateImagingResult(
        existing._id.toString(),
        {
          orderId: oid,
          result,
          updatedBy: actor,
          uploadedResult
        })
      : await this.createImagingResult({
        orderId: oid,
        result,
        createdBy: actor,
        uploadedResult
      });

    return { ...savedResult, deletedImageIds, deletedResultFiles };
  }

  async createImagingResult({
    orderId,
    result,
    createdBy,
    uploadedResult,
  }: {
    orderId: Types.ObjectId;
    result?: ImagingResultData;
    createdBy: { userId: string; userType: ActorType };
    uploadedResult?: LabTestResult["uploadedResult"];
  }) {
    return this.imagingResultRepo.create({
      orderId,
      result,
      uploadedResult: uploadedResult ?? [],
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
      uploadedResult: LabTestResult["uploadedResult"];
    }>
  ) {
    const updatePayload: any = {
      updatedAt: new Date(),
    };

    if (payload.orderId) updatePayload.orderId = payload.orderId;
    if (payload.result) updatePayload.result = payload.result;
    if (payload.updatedBy) updatePayload.updatedBy = payload.updatedBy;
    if (payload.uploadedResult) updatePayload.uploadedResult = payload.uploadedResult;

    return this.imagingResultRepo.updateById(id, updatePayload);
  }

  // HELPER FUNCTIONS
  private getDeletedImageIds(
    oldImages?: { id: string }[],
    newImages?: { id: string }[]
  ): string[] {
    if (!oldImages || !newImages) return [];
    const newIds = newImages.map(img => img.id);
    return oldImages.filter(img => !newIds.includes(img.id)).map(img => img.id);
  }

  private getDeletedUploadedFileIds(
    oldFiles?: { id: string }[],
    newFiles?: { id: string }[]
  ): string[] {
    if (!oldFiles || !newFiles) return [];
    const newIds = newFiles.map(file => file.id);
    return oldFiles.filter(file => !newIds.includes(file.id)).map(file => file.id);
  }


}
