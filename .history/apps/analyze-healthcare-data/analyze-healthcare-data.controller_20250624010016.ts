import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('analyze-healthcare-data')
export class AnalyzeHealthcareDataController {
    constructor(
        private readonly analyzeHealthcareDataService: AnalyzeHealthcareDataService,
      ) { }
    
      // Patient routes
       @MessagePattern('create-patient')
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

        async createPatient(
          @Payload()
          data: {
            createPatientDto: CreatePatientDto;
            userId: string;
          },
        ) {
          try {
            const { createPatientDto, userId } = data;
            const createPatient = await this.patientsService.createPatient(createPatientDto, userId);
            return createPatient;
          } catch (error) {
            console.error('Error in createPatient:', error);
            throw error;
          }
        }
}
