import { Controller, Get, Post, Query, Req } from "@nestjs/common";
import { LabOrderService } from "./lab-order.service";
import { Request } from "express";

@Controller('lab-order')
export class LabOrderController {
  constructor(
    private readonly labOrderService: LabOrderService
  ) { }

  @Post('/')
  createLabOrder(@Req() req: Request) {
    return this.labOrderService.createLabField(req);
  }

  @Get('/')
  getLabOrderByReportId(
    @Req() req: Request,
    @Query() query: Record<string, any>
  ) {
    return this.labOrderService.getLabOrderByReportId(query, req);
  }
}
