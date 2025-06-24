import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';

@Controller('analyze-healthcare-data')
export class AnalyzeHealthcareDataController {
    constructor(
        private readonly analyzeHealthcareDataService: AnalyzeHealthcareDataService,
      ) { }
    
      // Patient routes
      @Post('/input-vital-signs')
      @UseGuards(JwtAuthGuard)
      async inputVitalSigns(
        @Body() inputVitalDto: InputVitalDto,
        @CurrentUser() user: UserDocument,
      ) {
        try {
          const newPatient = await this.analyzeHealthcareDataService.inputVital(inputVitalDto, user._id.toString());
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
