import { CurrentUser } from '@app/common';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

@Controller('analyze-healthcare-data')
export class AnalyzeHealthcareDataController {
    constructor(
        private readonly patientService: PatientService,
        private readonly favouriteDoctorService: FavouriteDoctorService,
        private readonly downLoadMedicalReport: DownLoadMedicalReportService,
    
      ) { }
    
      // Patient routes
      @Post('/create-patient')
      @UseGuards(JwtAuthGuard)
      async createPatient(
        @Body() createPatientDto: CreatePatientDto,
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
