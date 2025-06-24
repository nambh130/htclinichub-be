import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

@Controller('analyze-healthcare-data')
export class AnalyzeHealthcareDataController {
    constructor(
        private readonly patientService: PatientService,
      ) { }
    
      // Patient routes
      @Post('/input-vital-signs')
      @UseGuards(JwtAuthGuard)
      async inputVitalSigns(
        @Body() inputVitalDto: InputVitalDto,
        @CurrentUser() user: UserDocument,
      ) {
        try {
          const newPatient = await this.patientService.createPatient(inputVitalDto, user._id.toString());
          return {
            success: true,
            inputVitalDto,
            message: 'inputVitalDto created successfully'
          }
        } catch (error) {
          console.error('Error creating patient:', error);
          throw error;
        }
      }
}
