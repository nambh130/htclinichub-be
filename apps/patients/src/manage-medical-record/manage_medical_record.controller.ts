import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ManageMedicalRecordService } from './manage_medical_record.service';

@Controller('manage-medical-record')
export class ManageMedicalRecordController {
  constructor(
    private readonly manageMedicalRecordService: ManageMedicalRecordService,
  ) {}

  @Get('get-medical-records-by-userId/:userId')
  async getMedicalRecordsByUserId(@Param('userId') userId: string) {
    try {
      const result =
        await this.manageMedicalRecordService.getGroupedMedicalRecordsByUserId(
          userId,
        );

      return result;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  @Get('get-detail-medical-record/:mRid')
  async getDetailMedicalRecordsBymRId(@Param('mRid') mRid: string) {
    try {
      const result =
        await this.manageMedicalRecordService.getDetailMedicalRecordsBymRId(
          mRid,
        );

      return result;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  @Post('create-medical-record')
  async createMedicalRecord(@Payload() payload: any) {
    try {
      const data = {
        patient_id: payload.patient_id,
        appointment_id: payload.appointment_id,
      };
      const result =
        await this.manageMedicalRecordService.createMedicalRecord(data);

      return result;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }

  @Put('update-medical-record/:mRid')
  async updateMedicalRecord(@Param('mRid') mRid: string, @Payload() payload) {
    try {
      const data = {
        icd: payload.icd,
        symptoms: payload.symptoms,
        diagnosis: payload.diagnosis,
        treatmentDirection: payload.treatmentDirection,
        next_appoint: payload.next_appoint,
      };
      const result =
        await this.manageMedicalRecordService.updateMedicalRecord(mRid, data);

      return result;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  }
}
