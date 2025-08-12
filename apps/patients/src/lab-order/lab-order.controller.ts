import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { LabOrderService } from "./lab-order.service";
import { CreateManyLabOrderDto } from "./dtos/create-lab-order.dto";
import { CurrentUser, JwtAuthGuard, MEDIA_SERVICE, PATIENT_SERVICE, TokenPayload } from "@app/common";
import { isValidObjectId, Types } from "mongoose";
import { GetOrdersByRecordDto } from "./dtos/get-orders-by-record.dto";
import { GetOrdersByClinicDto } from "./dtos/get-orders-by-clinic.dto";
import { UpdateOrderItemStatusDto } from "./dtos/update-order-item-status.dto";
import { CreateQuantitativeResultDto } from "../lab-test-result/dtos/create-quantitative-result.dto";
import { TestResultService } from "../lab-test-result/lab-test-result.service";
import { CreateImagingTestResultDto } from "./dtos/save-imaging-result.dto";
import { ClientKafka } from "@nestjs/microservices";
import { DeleteMultipleFilesEvent } from "@app/common/events/media";
import { AddUploadedFileDto } from "./dtos/upload-result-file.dto";
import { RemoveResultFileDto } from "./dtos/remove-result-file.dto";

@Controller('lab-order')
export class LabOrderController {
  constructor(
    private readonly labOrderService: LabOrderService,
    private readonly resultService: TestResultService,
    @Inject(PATIENT_SERVICE)
    private readonly kafkaClient: ClientKafka,
  ) { }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createManyLabOrder(
    @Body() dto: CreateManyLabOrderDto,
    @CurrentUser() user: TokenPayload
  ) {
    return this.labOrderService.createLabOrder(
      {
        testType: dto.testType,
        labTestIds: dto.labTest,
        medicalReportId: dto.medicalReport,
        name: dto.name,
        clinicId: dto.clinicId
      },
      { userType: user.actorType, userId: user.userId });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getLabOrderByReportId(
    @Query() query: GetOrdersByRecordDto,
  ) {
    return this.labOrderService.getLabOrdersByReportId(
      {
        medicalReportId: query.recordId,
        page: query.page,
        limit: query.limit,
        type: query.testType
      }
    );
  }

  @Get('by-clinic')
  @UseGuards(JwtAuthGuard)
  async getLabOrderByClinic(
    @Query() query: GetOrdersByClinicDto,
  ) {
    return this.labOrderService.getLabOrderItemsForClinic(
      {
        labOrder: query.labOrderBarcode,
        medicalRecord: query.medicalRecordId,
        clinicId: query.clinicId,
        startDate: query.startDate,
        endDate: query.endDate,
        testType: query.testType,
        page: query.page,
        limit: query.limit
      });
  }

  @Get('/item/:id')
  @UseGuards(JwtAuthGuard)
  async getOrderItemById(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid id format')
    }
    return this.labOrderService.getOrderItemById(id)
  }

  @Get('/:id/quantitative-result')
  @UseGuards(JwtAuthGuard)
  async getManyQuantResultByOrderItems(@Param('id') orderId: string) {
    if (!isValidObjectId(orderId)) {
      throw new BadRequestException("Invalid order id!");
    }
    return this.labOrderService.getQuantResultsFromOrderId(orderId);
  }


  @Patch('/item/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderItemStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderItemStatusDto,
    @CurrentUser() user: TokenPayload
  ) {
    return this.labOrderService.updateOrderItemStatus(
      {
        orderItemId: id,
        status: dto.status,
        clinicId: dto.clinicId,
      },
      { updatedById: user.userId, updatedByType: user.actorType }
    )
  }

  @Get('item/:id/quantitative-result')
  async getQuantResultByOrderItem(
    @Param('id') id: string
  ) {
    const response = await this.resultService.findQuantitativeResultByOrder(id);
    return response
  }

  @Get('item/:id/imaging-result')
  async getImagingResultByOrder(
    @Param('id') id: string
  ) {
    const response = await this.resultService.findImagingResultByOrder(id);
    return response
  }

  @Post('/item/quantitative-result')
  @UseGuards(JwtAuthGuard)
  async saveQuantitativeResult(
    @Body() dto: CreateQuantitativeResultDto,
    @CurrentUser() user: TokenPayload
  ) {
    const updateResult = await this.labOrderService.saveQuantitativeResult(
      {
        orderItemId: dto.orderItemId,
        result: dto.result, actor: { userId: user.userId, userType: user.actorType },
        //uploadedResult: dto.uploadedResult,
        accept: dto.accept
      }
    )

    if (updateResult.deletedResultFiles) {
      this.kafkaClient.emit('delete-multiple-files',
        new DeleteMultipleFilesEvent({ currentUser: user, ids: updateResult.deletedResultFiles })
      )
    }
  }

  @Post('/item/result-file/add')
  async addUploadedResultFile(
    @Body() dto: AddUploadedFileDto
  ) {
    const updateResult = await this.resultService.addResultFile({
      orderItemId: dto.orderItemId,
      resultFile: dto.uploadedResult
    })
    return updateResult
  }

  @Post('/item/result-file/remove')
  async removeUploadedResultFile(
    @Body() dto: RemoveResultFileDto,
    @CurrentUser() user: TokenPayload
  ) {
    const updateResult = await this.resultService.removeResultFile({
      orderItemId: dto.orderItemId,
      resultFileId: dto.resultFileId
    })
    this.kafkaClient.emit('delete-multiple-files',
      new DeleteMultipleFilesEvent({ currentUser: user, ids: [dto.orderItemId] })
    )
    return updateResult
  }

  @Post('/item/imaging-result')
  @UseGuards(JwtAuthGuard)
  async saveImagingResult(
    @Body() dto: CreateImagingTestResultDto,
    @CurrentUser() user: TokenPayload
  ) {
    const { accept, result, orderItemId, uploadedResult } = dto

    const updateResult = await this.labOrderService.saveImagingResult(
      {
        orderItemId,
        result,
        //uploadedResult,
        actor: { userId: user.userId, userType: user.actorType },
        accept
      }
    );

    const deletedFiles = []
    if (updateResult.deletedImageIds?.length > 0) {
      updateResult.deletedImageIds.map(item => deletedFiles.push(item))
    }
    if (updateResult.deletedResultFiles?.length > 0) {
      updateResult.deletedResultFiles.map(item => deletedFiles.push(item))
    }
    if (deletedFiles.length > 0)
      this.kafkaClient.emit('delete-multiple-files',
        new DeleteMultipleFilesEvent({ currentUser: user, ids: updateResult.deletedImageIds })
      )
    return updateResult
  }
}
