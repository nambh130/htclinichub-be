import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { LabOrderService } from "./lab-order.service";
import { CreateManyLabOrderDto } from "./dtos/create-lab-order.dto";
import { CurrentUser, JwtAuthGuard, TokenPayload } from "@app/common";
import { isValidObjectId } from "mongoose";

@Controller('lab-order')
export class LabOrderController {
  constructor(
    private readonly labOrderService: LabOrderService
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
        name: dto.name
      },
      { userType: user.actorType, userId: user.userId });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getLabOrderByReportId(
    @Query('reportId') reportId: string
  ) {
    if (!isValidObjectId(reportId)) {
      throw new BadRequestException("Invalid id")
    }
    return this.labOrderService.getLabOrdersByReportId(reportId);
  }
}
