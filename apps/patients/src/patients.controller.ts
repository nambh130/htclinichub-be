import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { CreatePatientDto, FavouriteDoctorDto, UpdatePatientDto } from '@app/common/dto';
import { PatientCreatedEvent } from '@app/common/events/patients';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
import { CurrentUser, TokenPayload } from '@app/common';
// import { DownLoadMedicalReportService } from './medical-report/download_medical_report';

@Controller('patient-service')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly favouriteDoctorService: FavouriteDoctorService,
    // private readonly downLoadMedicalReportService: DownLoadMedicalReportService,
  ) { }

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

      return createdPatient;
    } catch (error) {
      console.error('Error in createPatient:', error?.response?.data || error);
    }
  }

  @EventPattern('patient-created')
  handleCreatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
    patientCreatedEvent.toString();
  }

  @Put('update-patient/:patient_account_id')
  async updatePatient(
    @Param('patient_account_id') patient_account_id: string,
    @Body() data: {
      updatePatientDto: UpdatePatientDto;
      currentUser: TokenPayload;
    },
  ) {
    const { updatePatientDto, currentUser } = data;

    return await this.patientsService.updatePatient(
      patient_account_id,
      updatePatientDto,
      currentUser.userId
    );
  }

  @EventPattern('patient-updated')
  handlUpdatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
    patientCreatedEvent.toString();
  }

  @Delete('delete-patient/:id')
  async removePatient(
    @Param('id') id: string,
  ) {
    try {
      const deletedPatient = await this.patientsService.deletePatient(id);

      return {
        success: true,
        message: 'Patient deleted successfully',
        data: deletedPatient,
      };
    } catch (error) {
      console.error('Error in removePatient:', error);
    }
  }

  @Get('get-patient-by-id/:id')
  async getPatientById(
    @Param('id') id: string,
  ) {
    try {
      const patient = await this.patientsService.getPatientById(id);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-patient-by-fullName/:fullName')
  async getPatientByFullName(
    @Param('fullName') fullName: string,
  ) {
    try {
      const patient = await this.patientsService.getPatientByFullName(fullName);
      return patient;
    } catch (error) {
      console.error('Error in getPatientByFullName:', error);
      throw error;
    }
  }

  @Get('get-patient-by-phone/:phoneNumber')
  async getPatientByPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,

  ) {
    try {
      const patient = await this.patientsService.getPatientByPhoneNumber(phoneNumber);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-patient-by-cid/:cid')
  async getPatientByCid(
    @Param('cid') cid: string,

  ) {
    try {
      const patient = await this.patientsService.getPatientByCid(cid);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('get-patient-by-hid/:hid')
  async getPatientByHid(
    @Param('hid') hid: string,

  ) {
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
      const result = await this.favouriteDoctorService.addFavouriteDoctor(userId, favouriteDoctorDto);
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
  async getPatientProfileByAccountId(
    @Param('account_id') account_id: string,
  ) {
    try {
      const patient = await this.patientsService.getPatientProfileByAccountId(account_id);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }
}
