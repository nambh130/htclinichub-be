import { InjectModel } from "@nestjs/mongoose";
import { QuantitativeTestResult } from "../models/quantitative-lab-result.schema";
import { Model, Types, UpdateQuery } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuantitativeResultRepository {
  constructor(
    @InjectModel(QuantitativeTestResult.name, 'patientService')
    readonly quantitativeTestModel: Model<QuantitativeTestResult>
  ) { }

  // Create a new test result
  async create(data: Partial<QuantitativeTestResult>) {
    const created = new this.quantitativeTestModel(data);
    return created.save();
  }

  // Find one by ID
  async findById(id: string) {
    return this.quantitativeTestModel.findById(id).exec();
  }

  // Find many with filter
  async find(filter: Record<string, any>) {
    return this.quantitativeTestModel.find(filter).exec();
  }

  async findOne(filter: Record<string, any>) {
    return this.quantitativeTestModel.findOne(filter).exec();
  }

  // Update by ID
  async updateById(id: string, update: Partial<QuantitativeTestResult>) {
    return this.quantitativeTestModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  // Update by orderId
  async updateByOrderId(orderId: Types.ObjectId, update: UpdateQuery<QuantitativeTestResult>) {
    console.log(await this.quantitativeTestModel.findOne({ orderId }))
    return this.quantitativeTestModel.findOneAndUpdate({ orderId }, update, { new: true }).exec();
  }

  // Delete by ID
  async deleteById(id: string) {
    return this.quantitativeTestModel.findByIdAndDelete(id).exec();
  }

  // Count matching documents
  async count(filter: Record<string, any> = {}) {
    return this.quantitativeTestModel.countDocuments(filter).exec();
  }
}
