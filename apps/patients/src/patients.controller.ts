import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  FavouriteDoctorDto,
  UpdatePatientDto,
} from '@app/common/dto';
import { PatientCreatedEvent } from '@app/common/events/patients';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
import { CurrentUser, TokenPayload } from '@app/common';
import { CreateAppointmentDto } from '@app/common/dto/appointment';
import { log } from 'console';
// import { DownLoadMedicalReportService } from './medical-report/download_medical_report';

@Controller('patient-service')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly favouriteDoctorService: FavouriteDoctorService,
    // private readonly downLoadMedicalReportService: DownLoadMedicalReportService,
  ) {}

  @Post('create-patient')
  async createPatient(
    @Body()
    payload: {
      createPatientDto: CreatePatientDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { createPatientDto, currentUser } = payload;

      const createdPatient = await this.patientsService.createPatient(
        createPatientDto,
        currentUser.userId,
      );

      return {
        success: true,
        data: createdPatient,
      };
    } catch (error) {
      console.error('Error in createPatient:', error?.response?.data || error);

      return {
        success: false,
        message: 'Failed to create patient',
        error: error?.message || 'Unknown error',
      };
    }
  }

  @EventPattern('patient-created')
  handleCreatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
    patientCreatedEvent.toString();
  }

  @Put('update-patient/:patient_account_id')
  async updatePatient(
    @Param('patient_account_id') patient_account_id: string,
    @Body()
    data: {
      updatePatientDto: UpdatePatientDto;
      currentUser: TokenPayload;
    },
  ) {
    const { updatePatientDto, currentUser } = data;

    return await this.patientsService.updatePatient(
      patient_account_id,
      updatePatientDto,
      currentUser.userId,
    );
  }

  @EventPattern('patient-updated')
  handlUpdatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
    patientCreatedEvent.toString();
  }

  @Delete('delete-patient/:id')
  async removePatient(@Param('id') id: string) {
    try {
      const deletedPatient = await this.patientsService.deletePatient(id);

      return {
        success: true,
        message: 'Patient deleted successfully',
        data: deletedPatient,
      };
    } catch (error) {
      console.error('Error in removePatient:', error);

      return {
        success: false,
        message: 'Failed to delete patient',
        error: error?.message || 'Unknown error',
      };
    }
  }

  @Get('get-patient-by-id/:id')
  async getPatientById(@Param('id') id: string) {
    try {
      const patient = await this.patientsService.getPatientById(id);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-patientProfile-by-id/:id')
  async getPatientProfileById(@Param('id') id: string) {
    try {
      const patient = await this.patientsService.getPatientProfileById(id);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-patient-by-fullName/:fullName')
  async getPatientByFullName(@Param('fullName') fullName: string) {
    try {
      const patient = await this.patientsService.getPatientByFullName(fullName);
      return patient;
    } catch (error) {
      console.error('Error in getPatientByFullName:', error);
      throw error;
    }
  }

  @Get('get-patient-by-phone/:phoneNumber')
  async getPatientByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    try {
      const patient =
        await this.patientsService.getPatientByPhoneNumber(phoneNumber);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-patient-by-cid/:cid')
  async getPatientByCid(@Param('cid') cid: string) {
    try {
      const patient = await this.patientsService.getPatientByCid(cid);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-patient-by-hid/:hid')
  async getPatientByHid(@Param('hid') hid: string) {
    try {
      const patient = await this.patientsService.getPatientByHid(hid);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-all-patients')
  async getAllPatients() {
    try {
      const patient = await this.patientsService.getAllPatients();
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Post('add-favourite-doctors')
  async addFavouriteDoctor(
    @Body()
    payload: {
      userId: string;
      favouriteDoctorDto: FavouriteDoctorDto;
    },
  ) {
    try {
      const { userId, favouriteDoctorDto } = payload;
      const result = await this.favouriteDoctorService.addFavouriteDoctor(
        userId,
        favouriteDoctorDto,
      );
      return result;
    } catch (error) {
      console.error('Error in addFavouriteDoctor:', error);
      throw error;
    }
  }

  // @MessagePattern('download-medical-report')
  // async downloadMedicalReport(
  //   @Payload()
  //   data: {
  //     userId: string;
  //     patient_account_id: string,
  //   },
  // ) {
  //   try {
  //     const { userId, patient_account_id } = data;
  //     const result = await this.downLoadMedicalReportService.downloadMedicalReport(userId, patient_account_id);
  //     return result
  //   } catch (error) {
  //     console.error('Error in addFavouriteDoctor:', error);
  //     throw error;
  //   }
  // }

  @Get('get-patientProfile-by-account_id/:account_id')
  async getPatientProfileByAccountId(@Param('account_id') account_id: string) {
    try {
      const patient =
        await this.patientsService.getPatientProfileByAccountId(account_id);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  //khanhlq
  @Post('/assign-to-clinic/:clinicId')
  async assignToClinic(
    @Param('clinicId') clinicId: string,
    @Body()
    payload: {
      userId: string;
    },
  ) {
    try {
      const { userId } = payload;
      const result = await this.patientsService.assignToClinic(
        userId,
        clinicId,
      );
      return result;
    } catch (error) {
      console.error('Error in assignToClinic:', error);
      throw error;
    }
  }

  @Get('get-patient-clinics/:id')
  async getPatientClinics(@Param('id') id: string) {
    try {
      const result = await this.patientsService.getPatientClinics(id);
      return result;
    } catch (error) {
      console.error('Error in getPatientClinics:', error);
      throw error;
    }
  }

  @Get('get-patient-account/:id')
  async getPatientAccount(@Param('id') id: string) {
    try {
      const result = await this.patientsService.getPatientAccount(id);
      return result;
    } catch (error) {
      console.error('Error in getPatientAccount:', error);
      throw error;
    }
  }

  @Get('get-patient-accounts')
  async getPatientAccounts() {
    try {
      const result = await this.patientsService.getPatientAccounts();
      return result;
    } catch (error) {
      console.error('Error in getPatientAccounts:', error);
      throw error;
    }
  }

  @Get('get-patient-by-account-id/:id')
  async getPatientByAccountId(@Param('id') id: string) {
    const patient = await this.patientsService.getPatientByAccountId(id);
    if (!patient) {
      return {
        message: 'Không có hồ sơ bệnh nhân',
        data: null,
      };
    }
    return patient;
  }

  @Post('appointment')
  async createAppointment(
    @Body('createAppointmentDto') createAppointmentDto: CreateAppointmentDto,
    @Body('user') user: TokenPayload,
  ) {
    const result = await this.patientsService.createAppointment(
      createAppointmentDto,
      user,
    );
    return result;
  }

  @Get('appointment/patient-account/:id')
  async getAppointmentsByPatientAccountId(@Param('id') id: string) {
    const result =
      await this.patientsService.getAppointmentsWithDetailsByAccountId(id);
    return result;
  }

  @Get('appointment/doctor-clinic-link')
  async getAppointmentByDoctorClinicLink(
    @Query('doctor_id') doctorId: string,
    @Query('clinic_id') clinicId: string,
  ) {
    return await this.patientsService.getAppointmentByDoctorClinicLink(
      doctorId,
      clinicId,
    );
  }

  @Get('appointment/:id')
  async getAppointment(@Param('id') id: string) {
    const result = await this.patientsService.getAppointment(id);
    return result;
  }

  @Put('cancel-appointment/:id')
  async updateAppointment(@Param('id') id: string) {
    const result = await this.patientsService.cancelAppointment(id);
    return result;
  }

  @Put('start-appointment/:id')
  async startAppointment(@Param('id') id: string) {
    const result = await this.patientsService.startAppointment(id);
    return result;
  }

  @Put('done-appointment/:id')
  async doneAppointment(@Param('id') id: string) {
    const result = await this.patientsService.doneAppointment(id);
    return result;
  }


  @Get('appointments/pending/:patientAccountId')
  async getPendingAppointments(
    @Param('patientAccountId') patientAccountId: string,
  ) {
    const result =
      await this.patientsService.getPendingAppointments(patientAccountId);
    return result;
  }

  @Get('appointments/done/:patientAccountId')
  async getDoneAppointments(
    @Param('patientAccountId') patientAccountId: string,
  ) {
    const result =
      await this.patientsService.getDoneAppointments(patientAccountId);
    return result;
  }

  @Get('icd/search')
  async searchICD(
    @Query('keyword') keyword: string,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.patientsService.searchICD(keyword, limit);
    return result;
  }
}
