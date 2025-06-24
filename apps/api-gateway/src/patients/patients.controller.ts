import { Controller, Post, Body, UseGuards, Put, Param, Delete, Get } from '@nestjs/common';
import { PatientService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, FavouriteDoctorDto } from '@app/common';
import { CurrentUser, JwtAuthGuard, UserDocument } from '@app/common';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
import { DownLoadMedicalReportService } from './medical-report/download_medical_report.service';

@Controller('patients')
export class PatientsController {
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

  @Get('/get-patient-by-id/:id')
  // @UseGuards(JwtAuthGuard)
  async getPatientById(
    @Param('id') id: string,
    // @CurrentUser() user: UserDocument,
  ) {
    try {
      const patient = await this.patientService.getPatientById(id, "1");
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-patient-by-fullName/:fullName')
  @UseGuards(JwtAuthGuard)
  async getPatientByFullName(
    @Param('fullName') fullName: string,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const patient = await this.patientService.getPatientByFullName(fullName, user._id.toString());
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-patient-by-phone/:phoneNumber')
  @UseGuards(JwtAuthGuard)
  async getPatientByPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const patient = await this.patientService.getPatientByPhoneNumber(phoneNumber, user._id.toString());
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-all-patients')
  @UseGuards(JwtAuthGuard)
  async getAllPatients(
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const patient = await this.patientService.getAllPatients(user._id.toString());
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Post('/add-favourite-doctors')
  @UseGuards(JwtAuthGuard)
  async addFavouriteDoctor(
    @CurrentUser() user: UserDocument,
    @Body() favouriteDoctorDto: FavouriteDoctorDto
  ) {
    try {
      const result = await this.favouriteDoctorService.addFavouriteDoctor(user._id.toString(), favouriteDoctorDto);
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-favourite-doctors-list')
  @UseGuards(JwtAuthGuard)
  async getFavouriteDoctors(
    @CurrentUser() user: UserDocument,
  ) {
    try {
      const result = await this.favouriteDoctorService.getFavouriteDoctors(user._id.toString());
      return result;
    } catch (error) {
      console.error('Error retrieving favourite doctors:', error);
      throw error;
    }
  }

  @Post('/download-medical-report/:patient_account_id')
  @UseGuards(JwtAuthGuard)
  async downloadMedicalReport(
    @CurrentUser() user: UserDocument,
    @Param('patient_account_id') patient_account_id: string
  ) {
    try {
       const result = await this.downLoadMedicalReport.downloadMedicalReport(user._id.toString(), patient_account_id);
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
