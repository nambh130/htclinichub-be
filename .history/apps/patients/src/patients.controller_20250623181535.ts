import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { CreatePatientDto, FavouriteDoctorDto, UpdatePatientDto } from '@app/common/dto';
import { PatientCreatedEvent } from '@app/common/events/patients';
import { FavouriteDoctorService } from './favourite-doctor/favourite_doctor.service';
// import { DownLoadMedicalReportService } from './medical-report/download_medical_report';

@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly favouriteDoctorService: FavouriteDoctorService,
    // private readonly downLoadMedicalReportService: DownLoadMedicalReportService,

  ) { }

  @MessagePattern('create-patient')
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

  @EventPattern('patient-created')
  handleCreatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
    patientCreatedEvent.toString();
  }

  // @MessagePattern('findAllPatients')
  // findAll() {
  //   return this.patientsService.findAll();
  // }

  // @MessagePattern('findOnePatient')
  // findOne(@Payload() id: number) {
  //   return this.patientsService.findOne(id);
  // }

  @MessagePattern('update-patient')
  async updatePatient(
    @Payload()
    data: {
      patient_account_id: string;
      updatePatientDto: UpdatePatientDto;
      userId: string;
    },
  ) {
    try {
      const { patient_account_id, updatePatientDto, userId } = data;
      const createPatient = await this.patientsService.updatePatient(
        patient_account_id,
        updatePatientDto,
        userId);
      //  return {
      //   "Patient update successfully Patient Controller": createPatient,
      // };
      return createPatient;
    } catch (error) {
      console.error('Error in updatePatient:', error);
      throw error;
    }
  }

  @EventPattern('patient-updated')
  handlUpdatedPatient(@Payload() patientCreatedEvent: PatientCreatedEvent) {
    patientCreatedEvent.toString();
  }

  @MessagePattern('delete-patient')
  async removePatient(
    @Payload()
    data: {
      id: string;
      userId: string;
    },
  ) {
    try {
      const { id, userId } = data;
      const deletedPatient = await this.patientsService.deletePatient(id, userId);
      return deletedPatient;
    } catch (error) {
      console.error('Error in removePatient:', error);
      throw error;
    }
  }

  @MessagePattern('get-patient-by-id')
  async getPatientById(
    @Payload()
    data: {
      id: string;
      userId: string;
    },
  ) {
    try {
      const { id, userId } = data;
      const patient = await this.patientsService.getPatientById(id, userId);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @MessagePattern('get-patient-by-fullName')
  async getPatientByFullName(
    @Payload()
    data: {
      fullName: string;
      userId: string;
    },
  ) {
    try {
      const { fullName, userId } = data;
      const patient = await this.patientsService.getPatientByFullName(fullName, userId);
      return patient;
    } catch (error) {
      console.error('Error in getPatientByFullName:', error);
      throw error;
    }
  }

  @MessagePattern('get-patient-by-phone')
  async getPatientByPhoneNumber(
    @Payload()
    data: {
      phoneNumber: string;
      userId: string;
    },
  ) {
    try {
      const { phoneNumber, userId } = data;
      const patient = await this.patientsService.getPatientByPhoneNumber(phoneNumber, userId);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @MessagePattern('get-all-patients')
  async getAllPatients(
    @Payload()
    data: {
      userId: string;
    },
  ) {
    try {
      const { userId } = data;
      const patient = await this.patientsService.getAllPatients(userId);
      return patient;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @MessagePattern('add-favourite-doctors')
  async addFavouriteDoctor(
    @Payload()
    data: {
      userId: string;
      favouriteDoctorDto: FavouriteDoctorDto;
    },
  ) {
    try {
      const { userId, favouriteDoctorDto } = data;
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
}
