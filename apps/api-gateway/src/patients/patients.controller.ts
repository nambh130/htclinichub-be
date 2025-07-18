import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
  Get,
  Headers,
  Query,
} from '@nestjs/common';
import { PatientService } from './patients.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  FavouriteDoctorDto,
  TokenPayload,
  CreatePrescriptionDto,
} from '@app/common';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
import { ManageMedicalRecordService } from './manage-medical-record/manage_medical_record.service';
import { CreateAppointmentDto } from '@app/common/dto/appointment';
import { AppointmentService } from './appointment/appointment.service';
import { ICDService } from './icd/icd.service';
import { CreateMedicalRecordDto } from '@app/common/dto/medical-record';
import { UpdateMedicalRecordDto } from '@app/common/dto/medical-record/update-medical-record.dto';
import { Payload } from '@nestjs/microservices';
import { PrescriptionService } from './prescription_detail/prescription_detail.service';

@Controller('patient')
export class PatientsController {
  constructor(
    private readonly patientService: PatientService,
    private readonly favouriteDoctorService: FavouriteDoctorService,
    // private readonly downLoadMedicalReport: DownLoadMedicalReportService,
    private readonly manageMedicalRecordService: ManageMedicalRecordService,
    private readonly appointmentService: AppointmentService,
    private readonly ICDService: ICDService,
    private readonly prescriptionService: PrescriptionService,
  ) { }

  // Patient routes
  @Post('/create-patient')
  @UseGuards(JwtAuthGuard)
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const newPatient = await this.patientService.createPatient(
        createPatientDto,
        user,
      );
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
        user,
      );
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
      const patient = await this.patientService.getPatientByFullName(
        fullName,
        user,
      );
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
      const patient = await this.patientService.getPatientByPhoneNumber(
        phoneNumber,
        user,
      );
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
  async getAllPatients(@CurrentUser() user: TokenPayload) {
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
    @Body() favouriteDoctorDto: FavouriteDoctorDto,
  ) {
    try {
      const result = await this.favouriteDoctorService.addFavouriteDoctor(
        user,
        favouriteDoctorDto,
      );
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
      const result = await this.favouriteDoctorService.getFavouriteDoctors(
        user,
        patientId,
      );
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
      const patient = await this.patientService.getPatientProfileByAccountId(
        account_id,
        user,
      );
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
      const patient =
        await this.manageMedicalRecordService.getMedicalRecordsByUserId(
          userId,
          user,
        );
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Post('/medical-records')
  @UseGuards(JwtAuthGuard)
  async createMedicalRecord(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
  ) {
    try {
      // Validate the DTO
      if (
        !createMedicalRecordDto.patient_id ||
        !createMedicalRecordDto.appointment_id
      ) {
        throw new Error('patient_id and appointment_id are required');
      }
      const data = {
        patient_id: createMedicalRecordDto.patient_id,
        appointment_id: createMedicalRecordDto.appointment_id,
      };
      const result =
        await this.manageMedicalRecordService.createMedicalRecord(data);
      return result;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }

  //khanhlq
  @Post('/assign-to-clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async assignToClinic(
    @CurrentUser() user: TokenPayload,
    @Param('clinicId') clinicId: string,
  ) {
    try {
      const result = await this.patientService.assignToClinic(user, clinicId);
      return result;
    } catch (error) {
      console.error('Error assigning patient to clinic:', error);
      throw error;
    }
  }

  @Get('/:id/clinics')
  @UseGuards(JwtAuthGuard)
  async getPatientClinics(@Param('id') id: string) {
    try {
      const result = await this.patientService.getPatientClinics(id);
      return result;
    } catch (error) {
      console.error('Error retrieving patient clinics:', error);
      throw error;
    }
  }

  @Get('patient-account/:id')
  @UseGuards(JwtAuthGuard)
  async getPatientAccount(@Param('id') id: string) {
    try {
      const result = await this.patientService.getPatientAccount(id);
      return result;
    } catch (error) {
      console.error('Error retrieving patient account:', error);
      throw error;
    }
  }

  @Get('patient-accounts')
  @UseGuards(JwtAuthGuard)
  async getPatientAccounts() {
    try {
      const result = await this.patientService.getPatientAccounts();
      return result;
    } catch (error) {
      console.error('Error retrieving patient accounts:', error);
      throw error;
    }
  }

  @Get('get-patient-by-accountId/:id')
  @UseGuards(JwtAuthGuard)
  async getPatientByAccountId(@Param('id') id: string) {
    try {
      const result = await this.patientService.getPatientByAccountId(id);
      return result;
    } catch (error) {
      console.error('Error retrieving patient account:', error);
      throw error;
    }
  }

  @Post('create-appointment')
  @UseGuards(JwtAuthGuard)
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const result = await this.appointmentService.createAppointment(
        createAppointmentDto,
        user,
      );
      return result;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  @Get('get-appointments-by-patientAccountId/:id')
  @UseGuards(JwtAuthGuard)
  async getAppointments(@Param('id') id: string) {
    try {
      const result =
        await this.appointmentService.getAppointmentsByPatientAccountId(id);
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
      throw error;
    }
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  async getAppointmentsByDoctorClinicLinkId(
    @Query('clinic_id') clinic_id: string,
    @Query('doctor_id') doctor_id: string,
  ) {
    try {
      const result =
        await this.appointmentService.getAppointmentsByDoctorClinicLinkId(
          doctor_id,
          clinic_id,
        );
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
      throw error;
    }
  }

  @Get('get-appointment/:appoinmentId')
  @UseGuards(JwtAuthGuard)
  async getAppointment(@Param('appoinmentId') appoinmentId: string) {
    try {
      const result = await this.appointmentService.getAppointment(appoinmentId);
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
      throw error;
    }
  }
  @Put('cancel-appointment/:appoinmentId')
  @UseGuards(JwtAuthGuard)
  async updateAppointment(@Param('appoinmentId') appoinmentId: string) {
    try {
      const result =
        await this.appointmentService.cancelAppointment(appoinmentId);
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
      throw error;
    }
  }

  @Put('start-appointment/:appoinmentId')
  @UseGuards(JwtAuthGuard)
  async startAppointment(@Param('appoinmentId') appoinmentId: string) {
    try {
      const result =
        await this.appointmentService.startAppointment(appoinmentId);
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
      throw error;
    }
  }

  @Put('done-appointment/:appoinmentId')
  @UseGuards(JwtAuthGuard)
  async doneAppointment(@Param('appoinmentId') appoinmentId: string) {
    try {
      const result =
        await this.appointmentService.doneAppointment(appoinmentId);
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
      throw error;
    }
  }

  @Get('get-appointments/pending/:patientAccountId')
  @UseGuards(JwtAuthGuard)
  async getPendingAppointments(
    @Param('patientAccountId') patientAccountId: string,
  ) {
    try {
      const result =
        await this.appointmentService.getPendingAppointments(patientAccountId);
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
      throw error;
    }
  }
  @Get('get-appointments/done/:patientAccountId')
  @UseGuards(JwtAuthGuard)
  async getDoneAppointments(
    @Param('patientAccountId') patientAccountId: string,
  ) {
    try {
      const result =
        await this.appointmentService.getDoneAppointments(patientAccountId);
      return result;
    } catch (error) {
      console.error('Error retrieving appointments:', error);
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
      const patient =
        await this.manageMedicalRecordService.getDetailMedicalRecordsBymRId(
          mRid,
          user,
        );
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
  @Get('/search-icd')
  @UseGuards(JwtAuthGuard)
  async searchICD(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number,
  ) {
    try {
      const result = await this.ICDService.searchICD(keyword, limit);
      return result;
    } catch (error) {
      console.error('Error searching ICD:', error);
      throw error;
    }
  }

  @Put('/update-medical-record/:mRid')
  @UseGuards(JwtAuthGuard)
  async updateMedicalRecord(
    @Param('mRid') mRid: string,
    @Payload() payload: UpdateMedicalRecordDto,
  ) {
    try {
      const data = {
        icd: payload.icd,
        symptoms: payload.symptoms,
        diagnosis: payload.diagnosis,
        treatmentDirection: payload.treatmentDirection,
        next_appoint: payload.next_appoint,
      };
      const result = await this.manageMedicalRecordService.updateMedicalRecord(
        mRid,
        data,
      );

      return result;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  }

  @Get('/get-medical-record-by-appointmentId/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async getMedicalRecordsByAppointmentId(
    @Param('appointmentId') appointmentId: string,
  ) {
    try {
      const result =
        await this.manageMedicalRecordService.getMedicalRecordsByAppointmentId(
          appointmentId,
        );
      return result;
    } catch (error) {
      console.error('Error retrieving medical records:', error);
      throw error;
    }
  }

  //prescription_detail
  @Get('/get-prescriptions-by-mRId/:mRId')
  @UseGuards(JwtAuthGuard)
  async getPrescriptionsByMRId(
    @Param('mRId') mRId: string,
  ) {
    try {
      const result =
        await this.prescriptionService.getPrescriptionsByMRId(
          mRId,
        );
      return result;
    } catch (error) {
      console.error('Error retrieving medical records:', error);
      throw error;
    }
  }

  @Post('create-prescription-by-mRId/:mRId')
  @UseGuards(JwtAuthGuard)
  async createPrescription(
    @Param('mRId') mRId: string,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const result = await this.prescriptionService.createPrescription(
        mRId,
        createPrescriptionDto,
        user.userId.toString(),
      );
      return result;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
}
