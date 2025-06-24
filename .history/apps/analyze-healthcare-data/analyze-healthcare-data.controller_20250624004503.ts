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
        @Body() InputVitalDto: InputVitalDto,
        @CurrentUser() user: UserDocument,
      ) {
        try {
          const newPatient = await this.patientService.createPatient(createPatientDto, user._id.toString());
          return {
            success: true,
            createPatientDto,
            message: 'Patient created successfully'
          }
        } catch (error) {
          console.error('Error creating patient:', error);
          throw error;
        }
      }
}
