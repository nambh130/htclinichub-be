import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PatientService } from './patients.service';
import { CreatePatientDto } from '@app/common';
import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientService: PatientService) {}

 // Patient routes
  @Post('/create-patient')
  @UseGuards(JwtAuthGuard)
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: UserDocument,
  ) {
    console.log('API Controller:', createPatientDto, user._id.toString());
    this.patientService.createPatient(createPatientDto, user._id.toString());
    return { userId: user._id.toString(), createPatientDto };
  }
}
