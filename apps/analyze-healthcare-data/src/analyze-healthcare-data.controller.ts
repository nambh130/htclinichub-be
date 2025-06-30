import { CurrentUser, JwtAuthGuard, TokenPayload, UserDocument } from '@app/common';
import { InputVitalDto, UpdateVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('analyze-healthcare')
export class AnalyzeHealthcareDataController {
  constructor(
    private readonly analyzeHealthcareDataService: AnalyzeHealthcareDataService,
  ) { }

  @Post('input-vital-signs-data')
  async inputVitalSigns(
    @Body()
    payload: {
      inputVitalDto: InputVitalDto,
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { inputVitalDto, currentUser } = payload;
      const inputVitalData = await this.analyzeHealthcareDataService.inputVital(inputVitalDto, currentUser.userId);
      return inputVitalData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @Get('get-vital-signs-data/:patientId')
  async getVitalData(
    @Param('patientId') patientId: string,
  ) {
    try {
      const inputVitalData = await this.analyzeHealthcareDataService.getVitalSignsDataByPatientId(patientId);
      return inputVitalData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

    @Get('get-vital-signs/:id')
  async vitalSignsDataById(
    @Param('id') id: string,
  ) {
    try {
      const inputVitalData = await this.analyzeHealthcareDataService.vitalSignsDataById(id);
      return inputVitalData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @Put('update-vital-signs-data/:id')
  async updateupdateVitalController(
    @Param('id') id: string,
    @Body() data: {
      updateVitalDto: UpdateVitalDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { updateVitalDto, currentUser } = data;
      const createPatient = await this.analyzeHealthcareDataService.updateVitalService(
        id,
        updateVitalDto,
        currentUser.userId);
      //  return {
      //   "Patient update successfully Patient Controller": createPatient,
      // };
      return createPatient;
    } catch (error) {
      console.error('Error in updatePatient:', error);
      throw error;
    }
  }
}
