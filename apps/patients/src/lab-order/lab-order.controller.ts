import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
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
import { ImagingTestResult } from "../lab-test-result/models/imaging-test-result.schema";
import { DeleteMultipleFilesEvent } from "@app/common/events/media";

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
      query.recordId,
      query.page,
      query.limit);
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


  @Patch('/item/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderItemStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderItemStatusDto,
    @CurrentUser() user: TokenPayload
  ) {
    return this.labOrderService.updateOrderItemStatus(
      id, dto.status,
      { userId: user.userId, userType: user.actorType }
    )
  }

  @Get('item/:id/quantitative-result')
  async getQuantResultByOrder(
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
    return this.labOrderService.saveQuantitativeResult(
      dto.orderItemId, dto.result, user.userId, dto.accept
    )
  }

  @Post('/item/imaging-result')
  @UseGuards(JwtAuthGuard)
  async saveImagingResult(
    @Body() dto: CreateImagingTestResultDto,
    @CurrentUser() user: TokenPayload
  ) {
    const updateResult = await this.labOrderService.saveImagingResult(
      dto.orderItemId, dto.result, user.userId, dto.accept
    ) as ImagingTestResult & { deletedImageIds: string[] };
    if (updateResult.deletedImageIds.length > 0) {
      this.kafkaClient.emit('delete-multiple-files',
        new DeleteMultipleFilesEvent({ currentUser: user, ids: updateResult.deletedImageIds })
      )
    }
    return updateResult
  }
}
