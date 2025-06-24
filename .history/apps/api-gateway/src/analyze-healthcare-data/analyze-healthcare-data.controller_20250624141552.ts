import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { InputVitalDto, UpdateVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';

@Controller('analyze-healthcare-data')
export class AnalyzeHealthcareDataController {
  constructor(
    private readonly analyzeHealthcareDataService: AnalyzeHealthcareDataService,
  ) { }

  @Post('/input-vital-signs')
  @UseGuards(JwtAuthGuard)
  async inputVitalSigns(
    @Body() inputVitalDto: InputVitalDto,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const analyzeHealthcareData = await this.analyzeHealthcareDataService.inputVital(inputVitalDto, user._id.toString());
      return {
        success: true,
        inputVitalDto,
        message: 'input Vital successfully'
      }
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @Get('/vital-signs-data/:patientId')
  @UseGuards(JwtAuthGuard)
  async vitalSignsDataByPatientId(
    @Param('patientId') patientId: String,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const analyzeHealthcareData = await this.analyzeHealthcareDataService.getVitalSignsDataByPatientId(patientId, user._id.toString());
      return analyzeHealthcareData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @Put('/update-vital-signs/:patientId')
  @UseGuards(JwtAuthGuard)
  async updateVital(
    @Param('patientId') patientId: string,
    @Body() updateVitalDto: UpdateVitalDto,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const updatedPatient = await this.analyzeHealthcareDataService.updatePatient(
        patientId,
        updateVitalDto,
        user._id.toString());
      return {
        success: true,
        patientId: patientId,
        userId: user._id.toString(),
        data: updateVitalDto,
        message: 'Patient updated successfully'
      };
      // return updatedPatient;
    } catch (error) {
      console.error('Error update patient:', error);
      throw error;
    }
  }
}
