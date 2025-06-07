import { Controller, Post, Body, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { PatientService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from '@app/common';
import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientService: PatientService) { }

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

  @Put('/update-patient/:patient_account_id')
  @UseGuards(JwtAuthGuard)
  async updatePatient(
    @Param('patient_account_id') patient_account_id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const updatedPatient = await this.patientService.updatePatient(
        patient_account_id,
        updatePatientDto,
        user._id.toString());
      return {
        success: true,
        patient_account_id: patient_account_id,
        userId: user._id.toString(),
        data: updatePatientDto,
        message: 'Patient updated successfully'
      };
      // return updatedPatient;
    } catch (error) {
      console.error('Error update patient:', error);
      throw error;
    }
  }

  @Delete('/delete-patient/:id')
  @UseGuards(JwtAuthGuard)
  async deleteClinic(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const deletedPatient = await this.patientService.deletePatient(id, user._id.toString());
      return {
        success: true,
        id: id,
        message: 'Patient deleted successfully'
      };
    } catch (error) {
      console.error('Error update patient:', error);
      throw error;
    }
  }
}
