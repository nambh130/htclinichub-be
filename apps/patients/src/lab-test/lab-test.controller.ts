import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateLabFieldDto } from './dto/create-lab-field.dto';
import { LabTestService } from './lab-test.services';
import { GetLabFieldDto } from './dto/get-lab-field.dto';
import { CreateQuantitativeTestDto } from './dto/create-quantiative-test.dto';
import { isValidObjectId, Types } from 'mongoose';
import { UpdateQuantitativeTestDto } from './dto/update-quantiative-tes.dto';
import { UpdateLabFieldDto } from './dto/update-lab-field.dto';
import { FindLabTestDto } from './dto/get-lab-test.dto';
import { TestEnum } from './models/lab-test.schema';
import { CreateImagingTestDto } from './dto/create-imaging-test.dto';
import { UpdateImagingTestDto } from './dto/update-imaging-test.dto';

@Controller('lab-test')
export class LabTestController {
  constructor(private readonly labTestService: LabTestService) {}

  // ==================================
  //  LAB FIELDS FOR QUANTITATIVE TESTS
  // ==================================

  @Post('lab-field')
  async createLabField(@Body() dto: CreateLabFieldDto) {
    const {
      name,
      unit,
      loincCode,
      clinicId,
      lowReferenceRange,
      highReferenceRange,
    } = dto;
    return await this.labTestService.createLabField({
      name,
      unit,
      loincCode,
      referenceRange: {
        low: lowReferenceRange,
        high: highReferenceRange,
      },
      clinicId,
    });
  }

  @Patch('lab-field/:id')
  async updateLabField(
    @Body() dto: UpdateLabFieldDto,
    @Param('id') id: Types.ObjectId,
  ) {
    return this.labTestService.updateLabFields(id, dto);
  }

  @Delete('lab-field/:id')
  async deleteLabField(@Param('id') id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid id');
    return this.labTestService.deleteLabFields(new Types.ObjectId(id));
  }

  @Get('lab-field')
  getLabField(@Query() query: GetLabFieldDto) {
    const { clinicId, loincCode, name, limit, page } = query;
    return this.labTestService.findLabFields(
      { clinicId, loincCode, name },
      { limit, page },
    );
  }

  // ==================================
  //  ALL TESTS
  // ==================================

  @Get()
  async getAllTest(@Query() query: FindLabTestDto) {
    console.log(query);
    const { page, limit, testType, ...filter } = query;
    switch (testType) {
      case TestEnum.LAB:
        return await this.labTestService.findQuantitativeTest(filter, {
          page,
          limit,
        });
      case TestEnum.IMAGE:
        return await this.labTestService.findImagingTest(filter, {
          page,
          limit,
        });
      default:
        return await this.labTestService.findLabTest(filter, { page, limit });
    }
  }

  @Delete('/:id')
  async deleteLabTest(@Param('id') id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid id');
    return this.labTestService.deleteLabTest(new Types.ObjectId(id));
  }

  // ==================================
  //  QUANTITATIVE TESTS
  // ==================================

  @Get('quantitative/:id')
  async getQuantiativeById(@Param('id') id: Types.ObjectId) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid id');
    return await this.labTestService.getQuantitativeTestById(id);
  }

  @Post('quantitative')
  async createQuantiativeTest(@Body() dto: CreateQuantitativeTestDto) {
    const uniqueObjectIds = Array.from(
      new Map(dto.template.map((id) => [id.toString(), id])).values(),
    );

    return this.labTestService.createQuantitativeTest({
      template: uniqueObjectIds,
      ...dto,
    });
  }

  @Patch('quantitative/:id')
  async updateQuantiativeTest(
    @Body() dto: UpdateQuantitativeTestDto,
    @Param('id') id: Types.ObjectId,
  ) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalidd id');

    const uniqueObjectIds = Array.from(
      new Map(dto.template.map((id) => [id.toString(), id])).values(),
    );
    return this.labTestService.updateQuantiativeTest(new Types.ObjectId(id), {
      template: uniqueObjectIds,
      ...dto,
    });
  }

  @Delete('quantitative/:id')
  async deleteQuantitativeTest(@Param('id') id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid id');
    return this.labTestService.deleteQuantitativeTest(new Types.ObjectId(id));
  }

  // ==================================
  //  IMAGING TESTS
  // ==================================
  @Post('imaging')
  async createImagingTest(@Body() dto: CreateImagingTestDto) {
    return await this.labTestService.createImagingTest(dto);
  }

  @Get('imaging/:id')
  async getImagingTestById(@Param('id') id: string) {
    return await this.labTestService.getImagingTestById(new Types.ObjectId(id));
  }

  @Patch('imaging/:id')
  async updateImagingTest(
    @Param('id') id: string,
    @Body() dto: UpdateImagingTestDto,
  ) {
    return await this.labTestService.updateImagingTest(
      new Types.ObjectId(id),
      dto,
    );
  }

  //@Delete('imaging/:id')
  //async deleteImagingTest(@Param('id') id: string) {
  //  return await this.labTestService.deleteImagingTest(new Types.ObjectId(id));
  //}
}
