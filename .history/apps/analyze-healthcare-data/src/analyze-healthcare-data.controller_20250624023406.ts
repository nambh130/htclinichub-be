import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('analyze-healthcare-data')
export class AnalyzeHealthcareDataController {
  constructor(
    private readonly analyzeHealthcareDataService: AnalyzeHealthcareDataService,
  ) { }

  @MessagePattern('input-vital-signs-data')
  async inputVitalSigns(
    @Payload()
    data: {
      inputVitalDto: InputVitalDto,
      userId: string,
    },
  ) {
    try {
      const { inputVitalDto, userId } = data;
      const inputVitalData = await this.analyzeHealthcareDataService.inputVital(inputVitalDto, userId);
      return inputVitalData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }

  @MessagePattern('get-vital-signs-data')
  async get(
    @Payload()
    data: {
      patientId: String,
      userId: string,
    },
  ) {
    try {
      const { patientId, userId } = data;
      const inputVitalData = await this.analyzeHealthcareDataService.inputVital(inputVitalDto, userId);
      return inputVitalData;
    } catch (error) {
      console.error('Error input Vital:', error);
      throw error;
    }
  }
}
