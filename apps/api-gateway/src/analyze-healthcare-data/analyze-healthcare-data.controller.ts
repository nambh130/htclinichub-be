import { CurrentUser, JwtAuthGuard, TokenPayload } from '@app/common';
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
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      console.log("inputVitalDto", inputVitalDto)
      const analyzeHealthcareData = await this.analyzeHealthcareDataService.inputVital(inputVitalDto, user);
      return analyzeHealthcareData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @Get('/vital-signs-data/:patientId')
  @UseGuards(JwtAuthGuard)
  async vitalSignsDataByPatientId(
    @Param('patientId') patientId: String,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const analyzeHealthcareData = await this.analyzeHealthcareDataService.getVitalSignsDataByPatientId(patientId, user);
      return analyzeHealthcareData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @Get('/vital-signs/:id')
  @UseGuards(JwtAuthGuard)
  async vitalSignsDataById(
    @Param('id') id: String,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const analyzeHealthcareData = await this.analyzeHealthcareDataService.vitalSignsDataById(id, user);
      return analyzeHealthcareData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @Put('/update-vital-signs/:id')
  @UseGuards(JwtAuthGuard)
  async updateVital(
    @Param('id') id: string,
    @Body() updateVitalDto: UpdateVitalDto,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const updatedPatient = await this.analyzeHealthcareDataService.updateVital(
        id,
        updateVitalDto,
        user);
      return {
        success: true,
        patientId: id,
        userId: user,
        data: updateVitalDto,
        message: 'Patient updated successfully'
      };
      // return updatedPatient;
    } catch (error) {
      console.error('Error update patient:', error);
      throw error;
    }
  }

   @Get('/vital-in-mRId/:mRId')
  @UseGuards(JwtAuthGuard)
  async vitalInMRId(
    @Param('mRId') mRId: String,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const analyzeHealthcareData = await this.analyzeHealthcareDataService.vitalInMRId(mRId, user);
      return analyzeHealthcareData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }
}
