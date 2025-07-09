import { Controller, Post, Body, UseGuards, Put, Param, Delete, Get, Headers } from '@nestjs/common';
import { PatientService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, FavouriteDoctorDto, TokenPayload } from '@app/common';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
import { ManageMedicalRecordService } from './manage-medical-record/manage_medical_record.service';

@Controller('patient')
export class PatientsController {
  constructor(
    private readonly patientService: PatientService,
    private readonly favouriteDoctorService: FavouriteDoctorService,
    // private readonly downLoadMedicalReport: DownLoadMedicalReportService,
    private readonly manageMedicalRecordService: ManageMedicalRecordService,
  ) { }

  // Patient routes
  @Post('/create-patient')
  @UseGuards(JwtAuthGuard)
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const newPatient = await this.patientService.createPatient(createPatientDto, user);
      return newPatient;
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
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const updatedPatient = await this.patientService.updatePatient(
        patient_account_id,
        updatePatientDto,
        user);
      return updatedPatient;
    } catch (error) {
      console.error('Error update patient:', error);
      throw error;
    }
  }

  @Delete('/delete-patient/:id')
  @UseGuards(JwtAuthGuard)
  async deletePatient(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const deletedPatient = await this.patientService.deletePatient(id, user);
      return deletedPatient;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  @Get('/get-patient-by-id/:id')
  @UseGuards(JwtAuthGuard)
  async getPatientById(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.patientService.getPatientById(id, user);
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
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.patientService.getPatientByFullName(fullName, user);
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
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.patientService.getPatientByPhoneNumber(phoneNumber, user);
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-patient-by-cid/:cid')
  @UseGuards(JwtAuthGuard)
  async getPatientByCid(
    @Param('cid') cid: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.patientService.getPatientByCid(cid, user);
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-patient-by-hid/:hid')
  @UseGuards(JwtAuthGuard)
  async getPatientByHid(
    @Param('hid') hid: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.patientService.getPatientByHid(hid, user);
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-all-patients')
  @UseGuards(JwtAuthGuard)
  async getAllPatients(
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.patientService.getAllPatients(user);
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Post('/add-favourite-doctors')
  @UseGuards(JwtAuthGuard)
  async addFavouriteDoctor(
    @CurrentUser() user: TokenPayload,
    @Body() favouriteDoctorDto: FavouriteDoctorDto
  ) {
    try {
      const result = await this.favouriteDoctorService.addFavouriteDoctor(user, favouriteDoctorDto);
      return result;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-favourite-doctors-list/:patientId')
  @UseGuards(JwtAuthGuard)
  async getFavouriteDoctors(
    @Param('patientId') patientId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const result = await this.favouriteDoctorService.getFavouriteDoctors(user, patientId);
      return result;
    } catch (error) {
      console.error('Error retrieving favourite doctors:', error);
      throw error;
    }
  }

  @Get('/get-patientProfile-by-account_id/:account_id')
  @UseGuards(JwtAuthGuard)
  async getPatientProfileByAccountId(
    @Param('account_id') account_id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.patientService.getPatientProfileByAccountId(account_id, user);
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  // @Post('/download-medical-report/:patient_account_id')
  // @UseGuards(JwtAuthGuard)
  // async downloadMedicalReport(
  //   @CurrentUser() user: TokenPayload,
  //   @Param('patient_account_id') patient_account_id: string
  // ) {
  //   try {
  //      const result = await this.downLoadMedicalReport.downloadMedicalReport(user._id.toString(), patient_account_id);
  //     return result;
  //   } catch (error) {
  //     console.error('Error retrieving patient:', error);
  //     throw error;
  //   }
  // }

  @Get('/get-medical-records-by-userId/:userId')
  @UseGuards(JwtAuthGuard)
  async getMedicalRecordsByUserId(
    @Param('userId') userId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.manageMedicalRecordService.getMedicalRecordsByUserId(userId, user);
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/get-detail-medical-record/:mRid')
  @UseGuards(JwtAuthGuard)
  async getDetailMedicalRecordsBymRId(
    @Param('mRid') mRid: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const patient = await this.manageMedicalRecordService.getDetailMedicalRecordsBymRId(mRid, user);
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
