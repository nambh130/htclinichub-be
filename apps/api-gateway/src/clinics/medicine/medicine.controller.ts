import { Body, Controller, Get, Param, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MedicineService } from "./medicine.service";
import { CurrentUser, JwtAuthGuard, TokenPayload } from "@app/common";
import { ImportMedicineDto, UpdateMedicineDto } from "@app/common/dto/staffs/medicine";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from 'express';

@Controller('clinic/medicine')
export class MedicineController {
  constructor(
    private readonly medicineService: MedicineService,
  ) { }
  @Post('/import-csv-to-medicine-data/:clinicId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importMedicineData(
    @Param('clinicId') clinicId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const result = await this.medicineService.importMedicineCsvHttp(file, clinicId);
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Post('/input-data-to-medicine-data/:clinicId')
  @UseGuards(JwtAuthGuard)
  async createMedicine(
    @Param('clinicId') clinicId: string,
    @Body() dto: ImportMedicineDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const result = await this.medicineService.createMedicine(dto, clinicId, currentUser);
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/medicine-data/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getMedicineClinicId(
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const medicines = await this.medicineService.getMedicineClinicId(clinicId, currentUser);
      return medicines;
    } catch (error) {
      console.error('Error retrieving shifts:', error);
      throw error;
    }
  }

  @Get('/search-medicine/:clinicId')
  @UseGuards(JwtAuthGuard)
  async searchMedicine(
    @Param('clinicId') clinicId: string,
    @Query('search') search: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const medicines = await this.medicineService.searchMedicine(clinicId, currentUser, search);
      return medicines;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }

  @Get('/:clinicId/medicine-info/:medicineId')
  @UseGuards(JwtAuthGuard)
  async medicineInfo(
    @Param('clinicId') clinicId: string,
    @Param('medicineId') medicineId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const medicine = await this.medicineService.medicineInfo(clinicId, medicineId);
      return medicine;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }

  @Put('/:clinicId/update-medicine/:medicineId')
  @UseGuards(JwtAuthGuard)
  async medicineUpdate(
    @Param('clinicId') clinicId: string,
    @Param('medicineId') medicineId: string,
    @Body() dto: UpdateMedicineDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const medicine = await this.medicineService.medicineUpdate(clinicId, medicineId, dto, currentUser);
      return medicine;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }

  @Get('/export-medicine/:clinicId') //thay vì bấm send -> chọn send & download
  @UseGuards(JwtAuthGuard)
  async exportMedicinesToCSV(
    @Param('clinicId') clinicId: string,
    @Res() res: Response,
    @CurrentUser() currentUser: TokenPayload,

  ) {
    try {
      const response = await this.medicineService.exportMedicineDataToCSV(clinicId, currentUser);
      const { csv, clinicName } = response.data;
      const safeName = clinicName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `${safeName}-medicine-data.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting medicine data:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  @Get('medicine-data/:clinicId/by-category')
  @UseGuards(JwtAuthGuard)
  async getMedicineByCategory(
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
    @Query('category') category?: string,
  ) {
    try {
      const medicineList = await this.medicineService.getMedicineByCategory(clinicId, currentUser, category);
      return medicineList;
    } catch (error) {
      console.error('Error in getMedicineClinicId:', error);
      throw error;
    }
  }
}