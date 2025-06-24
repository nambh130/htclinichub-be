import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from '@app/common/dto/patients/create-patients.dto';
import { UpdatePatientDto } from '@app/common/dto/patients/update-patient.dto';
import { PatientRepository } from './patients.repository';
import { PATIENT_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { Patient } from './models';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PatientsService {
  constructor(
    private readonly patientsRepository: PatientRepository,
    @Inject(PATIENT_SERVICE)
    private readonly PatientsClient: ClientKafka,
  ) { }

  async createPatient(createPatientDto: CreatePatientDto, userId: string) {
    const newPatient = new Patient();
    newPatient.fullname = createPatientDto.fullname;
    newPatient.patient_account_id = createPatientDto.patient_account_id;
    newPatient.address1 = createPatientDto.address1;
    newPatient.gender = createPatientDto.gender;
    newPatient.ethnicity = createPatientDto.ethnicity;
    newPatient.marital_status = createPatientDto.marital_status;
    newPatient.nation = createPatientDto.nation;
    newPatient.work_address = createPatientDto.work_address;
    newPatient.relation = createPatientDto.relation;
    newPatient.medical_history.allergies = createPatientDto.medical_history.allergies;
    newPatient.medical_history.personal_history = createPatientDto.medical_history.personal_history;
    newPatient.medical_history.family_history = createPatientDto.medical_history.family_history;
    newPatient.createdBy = userId;
    if (createPatientDto.address2) newPatient.address2 = createPatientDto.address2;

    const existedPhone = await this.patientsRepository.findByPhone(createPatientDto.phone);
    if (existedPhone) {
      throw new BadRequestException('Số điện thoại đã tồn tại!');
    }
    newPatient.phone = createPatientDto.phone;

    try {
      const patient = await this.patientsRepository.create(newPatient);
      console.log('Patient saved:', patient);
      return patient;
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  }

  // findAll() {
  //   return `This action returns all patients`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} patient`;
  // }

  async updatePatient(
    patient_account_id: string,
    updatePatientDto: UpdatePatientDto,
    userId: string,
  ) {
    if (!patient_account_id) {
      throw new NotFoundException('Invalid patient_account_id');
    }

    try {
      const patient = await this.patientsRepository.findOne({
        patient_account_id: parseInt(patient_account_id),
      });

      if (!patient) {
        throw new NotFoundException(`Patient with patient_account_id ${patient_account_id} not found`);
      }

      if (updatePatientDto.phone) {
        const existedPhone = await this.patientsRepository.findByPhone(updatePatientDto.phone);

        // Nếu đã tồn tại và không phải chính bệnh nhân đang update thì báo lỗi
        if (existedPhone && existedPhone.patient_account_id !== patient.patient_account_id) {
          throw new BadRequestException('Số điện thoại đã tồn tại!');
        }
      }

      const updatedPatient = await this.patientsRepository.update(
        patient,
        {
          ...updatePatientDto,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      );

      if (!updatedPatient) {
        throw new NotFoundException(`Patient with patient_account_id ${patient_account_id} not updated`);
      }

      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: string, userId: string) {
    if (!id) {
      throw new NotFoundException('Invalid id');
    }

    try {
      const patient = await this.patientsRepository.findOne({ id: parseInt(id) });

      if (!patient) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }

      const deletedPatient = await this.patientsRepository.delete({ id: parseInt(id) });

      return {
        success: true,
        id: id,
        message: 'Patient deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async getPatientById(id: string, userId: string) {
    if (!id) {
      throw new NotFoundException('Invalid id');
    }

    try {
      const patient = await this.patientsRepository.findOne({ id: parseInt(id) });

      if (!patient) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }

      return {
        data: {
          id: patient.id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ? patient.address2 : 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
        }
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByFullName(fullName: string, userId: string) {
    if (!fullName) {
      throw new NotFoundException('Invalid fullName');
    }

    try {
      const patients = await this.patientsRepository.find({ fullname: fullName });

      if (!patients || patients.length === 0) {
        throw new NotFoundException(`Patient with name ${fullName} not found`);
      }

      return {
        data: patients.map(patient => ({
          id: patient.id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ?? 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
        }))
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByPhoneNumber(phoneNumber: string, userId: string) {
    if (!phoneNumber) {
      throw new NotFoundException('Invalid phoneNumber');
    }

    try {
      const patient = await this.patientsRepository.findOne({ phone: phoneNumber });

      if (!patient) {
        throw new NotFoundException(`Patient with phone ${phoneNumber} not found`);
      }

      return {
        data: {
          id: patient.id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ? patient.address2 : 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
        }
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getAllPatients(userId: string) {
    try {
      const patients = await this.patientsRepository.find({});

      if (!patients || patients.length === 0) {
        throw new NotFoundException(`Không có hồ sơ bệnh nhân nào`);
      }

      return {
        data: patients.map(patient => ({
          id: patient._,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ?? 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
        }))
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
