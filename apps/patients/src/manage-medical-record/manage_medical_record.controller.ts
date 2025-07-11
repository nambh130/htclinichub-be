import { Controller, Get, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ManageMedicalRecordService } from './manage_medical_record.service';

@Controller('manage-medical-record')
export class ManageMedicalRecordController {
  constructor(private readonly manageMedicalRecordService: ManageMedicalRecordService) { }

  @Get('get-medical-records-by-userId/:userId')
  async getMedicalRecordsByUserId(
    @Param('userId') userId: string,
  ) {
    try {
      const result = await this.manageMedicalRecordService.getGroupedMedicalRecordsByUserId(userId);
    
      return result;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  @Get('get-detail-medical-record/:mRid')
  async getDetailMedicalRecordsBymRId(
    @Param('mRid') mRid: string,
  ) {
    try {
      const result = await this.manageMedicalRecordService.getDetailMedicalRecordsBymRId(mRid);
    
      return result;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
}