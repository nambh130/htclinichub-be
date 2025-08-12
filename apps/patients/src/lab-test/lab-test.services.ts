import { Injectable } from '@nestjs/common';
import { LabFieldRepository } from './repositories/quantiative-template.repository';
import { LabField } from './models/lab-field.schema';
import { Types } from 'mongoose';
import { CreateQuantitativeTestDto } from './dto/create-quantiative-test.dto';
import { QuantitativeTestRepository } from './repositories/quantiative-test.repository';
import { UpdateQuantitativeTestDto } from './dto/update-quantiative-tes.dto';
import { UpdateLabFieldDto } from './dto/update-lab-field.dto';
import { LabTestRepository } from './repositories/lab-test.repoository';
import { ImagingTestRepository } from './repositories/imaging-test.repository';
import { CreateImagingTestDto } from './dto/create-imaging-test.dto';
import { UpdateImagingTestDto } from './dto/update-imaging-test.dto';

@Injectable()
export class LabTestService {
  constructor(
    private readonly labFieldRepo: LabFieldRepository,
    private readonly quantitativeTestRepo: QuantitativeTestRepository,
    private readonly labTestRepo: LabTestRepository,
    private readonly imagingRepo: ImagingTestRepository,
  ) {}

  // ==================================
  //  LAB FIELDS FOR QUANTITATIVE TESTS
  // ==================================

  async createLabField(labField: Partial<LabField>) {
    return await this.labFieldRepo.create({
      name: labField.name,
      loincCode: labField?.loincCode,
      unit: labField.unit,
      referenceRange: labField.referenceRange,
      clinicId: labField.clinicId,
    });
  }

  async findLabFields(
    filter: {
      clinicId: string;
      loincCode?: string;
      name?: string;
    },
    options: {
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { clinicId, loincCode, name } = filter;
    const { page = 1, limit = 10 } = options;

    const query: Record<string, any> = {};

    if (clinicId) query.clinicId = clinicId;
    if (loincCode) query.loincCode = { $regex: loincCode, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' }; // case-insensitive partial match

    const results = await this.labFieldRepo.labFieldModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.labFieldRepo.count(query);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateLabFields(id: Types.ObjectId, updateData: UpdateLabFieldDto) {
    return await this.labFieldRepo.findOneAndUpdate({ _id: id }, updateData);
  }

  async deleteLabFields(id: Types.ObjectId) {
    return await this.labFieldRepo.findOneAndDelete({ _id: id });
  }

  // ==================================
  //  ALL TESTS
  // ==================================

  async findLabTest(
    filter: {
      clinicId: string;
      name?: string;
      code?: string;
    },
    options: { page?: number; limit?: number },
  ) {
    const { clinicId, name, code } = filter;
    const { page = 1, limit = 10 } = options;

    const query: Record<string, any> = {};

    if (clinicId) query.clinicId = clinicId;
    if (name) query.name = { $regex: name, $options: 'i' };
    if (code) query.code = { $regex: code, $options: 'i' };

    console.log(query);
    const results = await this.labTestRepo.labTestModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.labTestRepo.count(query);
    console.log('total: ', total);
    console.log('data: ', results);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteLabTest(id: Types.ObjectId) {
    return await this.labTestRepo.findOneAndDelete(id);
  }

  // ==================================
  //  QUANTITATIVE TESTS
  // ==================================

  async getQuantitativeTestById(id: Types.ObjectId) {
    return await this.quantitativeTestRepo.quantitativeTestModel
      .findOne({ _id: id })
      .lean(true);
  }

  async findQuantitativeTest(
    filter: {
      clinicId: string;
      name?: string;
      code?: string;
    },
    options: { page?: number; limit?: number },
  ) {
    const { clinicId, name, code } = filter;
    const { page = 1, limit = 10 } = options;

    const query: Record<string, any> = {};

    if (clinicId) query.clinicId = clinicId;
    if (name) query.name = { $regex: name, $options: 'i' };
    if (code) query.code = { $regex: code, $options: 'i' };

    const results = await this.quantitativeTestRepo.quantitativeTestModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.quantitativeTestRepo.count(query);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createQuantitativeTest(test: CreateQuantitativeTestDto) {
    const transformedTemplate = test.template?.map((field) => ({
      loincCode: field.loincCode,
      name: field.name,
      unit: field.unit,
      referenceRange: {
        low: field.referenceRange.low,
        high: field.referenceRange.high,
      },
    }));

    return await this.quantitativeTestRepo.create({
      name: test.name,
      clinicId: test.clinicId,
      code: test.code,
      price: test.price,
      template: transformedTemplate,
    });
  }

  async updateQuantiativeTest(
    id: Types.ObjectId,
    dto: UpdateQuantitativeTestDto,
  ) {
    return await this.quantitativeTestRepo.findOneAndUpdate(id, dto);
  }

  async deleteQuantitativeTest(id: Types.ObjectId) {
    return await this.quantitativeTestRepo.findOneAndDelete(id);
  }

  // ==================================
  //  IMAGING TESTS
  // ==================================
  async createImagingTest(test: CreateImagingTestDto) {
    const template = {
      description: test.description,
      conclusion: test.conclusion,
    };
    return await this.imagingRepo.create({
      clinicId: test.clinicId,
      name: test.name,
      price: test.price,
      code: test.code,
      template,
    });
  }

  async getImagingTestById(id: Types.ObjectId) {
    return await this.imagingRepo.imagingTestModel
      .findOne({ _id: id })
      .lean(true);
  }

  async findImagingTest(
    filter: { clinicId: string; name?: string; code?: string },
    options: { page?: number; limit?: number },
  ) {
    const { clinicId, name, code } = filter;
    const { page = 1, limit = 10 } = options;

    const query: Record<string, any> = {};
    if (clinicId) query.clinicId = clinicId;
    if (name) query.name = { $regex: name, $options: 'i' };
    if (code) query.code = { $regex: code, $options: 'i' };

    const results = await this.imagingRepo.imagingTestModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.imagingRepo.count(query);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateImagingTest(id: Types.ObjectId, dto: UpdateImagingTestDto) {
    if (dto.description || dto.conclusion) {
      dto.template = {
        description: dto.description,
        conclusion: dto.conclusion,
      };
    }

    return await this.imagingRepo.findOneAndUpdate(id, dto);
  }

  async deleteImagingTest(id: Types.ObjectId) {
    return await this.imagingRepo.findOneAndDelete(id);
  }
}
