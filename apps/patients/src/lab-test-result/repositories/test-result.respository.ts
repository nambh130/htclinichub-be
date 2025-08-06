import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ImagingTestResult } from "../models/imaging-test-result.schema";
import { Injectable } from "@nestjs/common";
import { LabTestResult } from "../models/lab-result.schema";

@Injectable()
export class LabTestResultRepository {
  constructor(
    @InjectModel(LabTestResult.name, 'patientService')
    readonly LabTestResultModel: Model<LabTestResult>
  ) { }

  async create(data: Partial<ImagingTestResult>) {
    const created = new this.LabTestResultModel(data);
    return created.save();
  }

  async findById(id: string) {
    return this.LabTestResultModel.findById(id).exec();
  }

  async find(filter: Record<string, any>) {
    return this.LabTestResultModel.find(filter).exec();
  }

  async findByOrderId(orderId: Types.ObjectId) {
    return this.LabTestResultModel.findOne({ orderId }).exec();
  }

  async updateById(id: string, update: Partial<ImagingTestResult>) {
    return this.LabTestResultModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteById(id: string) {
    return this.LabTestResultModel.findByIdAndDelete(id).exec();
  }

  async deleteMany(ids: string[]) {
    return this.LabTestResultModel.deleteMany(ids).exec();
  }

  async count(filter: Record<string, any> = {}) {
    return this.LabTestResultModel.countDocuments(filter).exec();
  }
}

