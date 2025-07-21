import { Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { LabTestService } from "./lab-test.service";
import { Request } from "express";

@Controller('lab-test')
export class LabTestController {
  constructor(
    private readonly labTestService: LabTestService
  ) { }

  @Post('lab-field')
  createLabField(@Req() req: Request) {
    return this.labTestService.createLabField(req);
  }

  @Patch('lab-field/:id')
  updateLabField(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    return this.labTestService.updateLabField(id, req);
  }

  @Delete('lab-field/:id')
  deleteLabField(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    return this.labTestService.deleteLabField(id, req)
  }

  @Get('lab-field')
  getLabField(
    @Query() query: Record<string, any>,
    @Req() req: Request
  ) {
    return this.labTestService.getLabField(query, req)
  }

  // ==================================
  //  ALL TESTS
  // ==================================
  @Get()
  findLabTest(
    @Query() query: Record<string, any>,
    @Req() req: Request
  ) {
    return this.labTestService.findLabTest(query, req)
  }

  // ==================================
  //  QUANTITATIVE TESTS
  // ==================================
  @Get('quantitative/:id')
  getQuantitativeById(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
    @Req() req: Request
  ) {
    return this.labTestService.getQuantitativeById(id, query, req)
  }

  @Post('quantitative')
  createQuantiativeTest(@Req() req: Request) {
    return this.labTestService.createQuantitativeTest(req);
  }

  @Patch('quantitative/:id')
  updateQuantiativeTest(@Req() req: Request, @Param('id') id: string) {
    return this.labTestService.updateQuantitativeTest(id, req);
  }

  @Delete('quantitative/:id')
  deleteQuantitativeTest(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    return this.labTestService.deleteQuantitativeTest(id, req)
  }
  // ==================================
  //  IMAGING TESTS
  // ==================================
  @Get('imaging/:id')
  getImagingTestById(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    return this.labTestService.getImagingTestById(id, req)
  }

  @Post('imaging')
  createImagingTest(@Req() req: Request) {
    return this.labTestService.createImagingTest(req);
  }

  @Patch('imaging/:id')
  updateImagingTest(@Req() req: Request, @Param('id') id: string) {
    return this.labTestService.updateImagingTest(id, req);
  }
}
