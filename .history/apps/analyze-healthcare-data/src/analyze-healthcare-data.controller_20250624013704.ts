import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyzeHealthcareDataService } from '../analyze-healthcare-data.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('analyze-healthcare-data')
export class AnalyzeHealthcareDataController {
  constructor(
    private readonly analyzeHealthcareDataService: AnalyzeHealthcareDataService,
  ) { }

  // Patient routes
  @MessagePattern('input-vital-signs-data')
  @UseGuards(JwtAuthGuard)
  async inputVitalSigns(
    @Payload()
    data: {
      inputVitalDto: InputVitalDto,
      userId: string;
    },
  ) {
    try {
      const { inputVitalDto, userId } = data;
      const inputVitalData = await this.analyzeHealthcareDataService.inputVital(inputVitalDto, userId);
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
}
