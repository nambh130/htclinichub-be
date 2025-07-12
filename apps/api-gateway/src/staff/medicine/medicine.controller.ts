import { Body, Controller, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MedicineService } from "./medicine.service";
import { CurrentUser, JwtAuthGuard, TokenPayload } from "@app/common";
import { ImportMedicineDto, UpdateMedicineDto } from "@app/common/dto/staffs/medicine";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('staff/medicine')
export class MedicineController {
  constructor(
    private readonly medicineService: MedicineService,
  ) {}
@Post('/clinic/import-csv-to-medicine-data/:clinicId')
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

  @Post('/clinic/input-data-to-medicine-data/:clinicId')
  @UseGuards(JwtAuthGuard)
  async createMedicine(
    @Param('clinicId') clinicId: string,
    @Body() dto: ImportMedicineDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      console.log("dto:", dto)
      const result = await this.medicineService.createMedicine(dto, clinicId, currentUser);
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/clinic/medicine-data/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getMedicineClinicId(
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const shifts = await this.medicineService.getMedicineClinicId(clinicId, currentUser);
      return shifts;
    } catch (error) {
      console.error('Error retrieving shifts:', error);
      throw error;
    }
  }

  @Get('/clinic/search-medicine/:clinicId')
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

  @Get('/clinic/:clinicId/medicine-info/:medicineId')
  @UseGuards(JwtAuthGuard)
  async medicineInfo(
    @Param('clinicId') clinicId: string,
    @Param('medicineId') medicineId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const medicines = await this.medicineService.medicineInfo(clinicId, medicineId);
      return medicines;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }

  @Put('/clinic/:clinicId/update-medicine/:medicineId')
  @UseGuards(JwtAuthGuard)
  async medicineUpdate(
    @Param('clinicId') clinicId: string,
    @Param('medicineId') medicineId: string,
    @Body() dto: UpdateMedicineDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const medicines = await this.medicineService.medicineUpdate(clinicId, medicineId, dto, currentUser);
      return medicines;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }
}