import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ImagingTestResult } from "../models/imaging-test-result.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ImagingResultRepository {
  constructor(
    @InjectModel(ImagingTestResult.name, 'patientService')
    readonly imagingTestModel: Model<ImagingTestResult>
  ) { }

  async create(data: Partial<ImagingTestResult>) {
    const created = new this.imagingTestModel(data);
    return created.save();
  }

  // Find one by ID
  async findById(id: string) {
    return this.imagingTestModel.findById(id).exec();
  }

  // Find many with filter
  async find(filter: Record<string, any>) {
    return this.imagingTestModel.find(filter).exec();
  }

  async findByOrderId(orderId: Types.ObjectId) {
    return this.imagingTestModel.findOne({ orderId }).exec();
  }

  // Update by ID
  async updateById(id: string, update: Partial<ImagingTestResult>) {
    return this.imagingTestModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  // Delete by ID
  async deleteById(id: string) {
    return this.imagingTestModel.findByIdAndDelete(id).exec();
  }

  // Count matching documents
  async count(filter: Record<string, any> = {}) {
    return this.imagingTestModel.countDocuments(filter).exec();
  }
}
