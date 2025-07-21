import { UploadedFile, Controller, Post, UseInterceptors, Param, Body, Get, Query, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicineService } from './medicine.service';
import { ImportMedicineDto, UpdateMedicineDto } from '@app/common/dto/staffs/medicine';
import { TokenPayload } from '@app/common';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) { }

  @Post('import-csv-to-medicine-data/:clinicId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @Param('clinicId') clinicId: string,
    @UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.medicineService.importCsv(file, clinicId);
      return result;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Post('input-data-to-medicine-data/:clinicId')
  async createMedicine(
    @Param('clinicId') clinicId: string,
    @Body()
    payload: {
      dto: ImportMedicineDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { dto, currentUser } = payload;
      // console.log(payload);
      const shift = await this.medicineService.createMedicine(clinicId, dto);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('medicine-data/:clinicId')
  async getMedicineClinicId(
    @Param('clinicId') clinicId: string,
  ) {
    try {
      const shift = await this.medicineService.getMedicineClinicId(clinicId);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('search-medicine/:clinicId')
  async searchMedicine(
    @Param('clinicId') clinicId: string,
    @Query('search') search: string,
  ) {
    try {
      const result = await this.medicineService.searchMedicine(clinicId, search);
      return result;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }

  @Get('medicine-info/:clinicId/:medicineInfo')
  async medicineInfo(
    @Param('clinicId') clinicId: string,
    @Param('medicineInfo') medicineInfo: string,
  ) {
    try {
      const result = await this.medicineService.medicineInfo(clinicId, medicineInfo);
      return result;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }

  @Put('/:clinicId/update-medicine/:medicineId')
  async medicineUpdate(
    @Param('clinicId') clinicId: string,
    @Param('medicineId') medicineId: string,
    @Body()
    payload: {
      dto: UpdateMedicineDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { dto, currentUser } = payload;
      // console.log(payload);
      const shift = await this.medicineService.medicineUpdate(clinicId, medicineId, dto);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('export_medicine_csv/:clinicId')
  async handleExportCSV(
    @Param('clinicId') clinicId: string,
  ) {
    try {
      const result = await this.medicineService.exportMedicineDataToCSV(clinicId);
      return result;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }

  @Get('filter-category/:clinicId')
  async getMedicineByCategory(
    @Param('clinicId') clinicId: string,
    @Query('category') category: string,
  ) {
    try {
      const result = await this.medicineService.getMedicineByCategory(clinicId, category);
      return result;
    } catch (error) {
      console.error('Error retrieving medicine data:', error);
      throw error;
    }
  }
}
