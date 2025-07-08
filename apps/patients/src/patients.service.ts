import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from '@app/common/dto/patients/create-patients.dto';
import { UpdatePatientDto } from '@app/common/dto/patients/update-patient.dto';
import { PatientRepository } from './patients.repository';
import { CLINIC_SERVICE, PATIENT_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { Patient } from './models';
import { BadRequestException } from '@nestjs/common';
import { PatientAccountRepository } from './repositories/patient-account.repositoty';
import { PatientClinicLink } from './models/patient_clinic_link.entity';
import { PatientClinicLinkRepository } from './repositories/patient-clinic-link.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PatientsService {
  constructor(
    private readonly patientsRepository: PatientRepository,
    private readonly patientAccountRepo: PatientAccountRepository,
    private readonly patientClinicLinkRepo: PatientClinicLinkRepository,
    @Inject(PATIENT_SERVICE)
    private readonly PatientsClient: ClientKafka,
    @Inject(CLINIC_SERVICE) private readonly clinicsHttpService: HttpService,
  ) {}

  async createPatient(createPatientDto: CreatePatientDto, userId: string) {
    const existedPhone = await this.patientsRepository.findByPhone(
      createPatientDto.phone,
    );
    if (existedPhone) {
      throw new BadRequestException('Số điện thoại đã tồn tại!');
    }

    const existedCitizenId = await this.patientsRepository.findCitizenId(
      createPatientDto.citizen_id,
    );
    if (existedCitizenId) {
      throw new BadRequestException('CCCD đã tồn tại!');
    }

    const existedHealthInsuranceId =
      await this.patientsRepository.findHealthInsuranceId(
        createPatientDto.health_insurance_id,
      );
    if (existedHealthInsuranceId) {
      throw new BadRequestException('BHYT đã tồn tại!');
    }

    const patientData = {
      fullname: createPatientDto.fullname,
      patient_account_id: createPatientDto.patient_account_id,
      address1: createPatientDto.address1,
      address2: createPatientDto.address2 || '',
      gender: createPatientDto.gender,
      ethnicity: createPatientDto.ethnicity,
      marital_status: createPatientDto.marital_status,
      nation: createPatientDto.nation,
      work_address: createPatientDto.work_address,
      relation: createPatientDto.relation,
      citizen_id: createPatientDto.citizen_id,
      health_insurance_id: createPatientDto.health_insurance_id,
      phone: createPatientDto.phone,
      dOB: createPatientDto.dOB,
      createdBy: userId,
      medical_history: {
        allergies: createPatientDto.medical_history.allergies,
        personal_history: createPatientDto.medical_history.personal_history,
        family_history: createPatientDto.medical_history.family_history,
      },
    };

    try {
      const patient = await this.patientsRepository.createPatient(patientData);
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
        throw new NotFoundException(
          `Patient with patient_account_id ${patient_account_id} not found`,
        );
      }

      if (updatePatientDto.phone) {
        const existedPhone = await this.patientsRepository.findByPhone(
          updatePatientDto.phone,
        );

        // Nếu đã tồn tại và không phải chính bệnh nhân đang update thì báo lỗi
        if (
          existedPhone &&
          existedPhone.patient_account_id !== patient.patient_account_id
        ) {
          throw new BadRequestException('Số điện thoại đã tồn tại!');
        }
      }

      if (updatePatientDto.citizen_id) {
        const existedCitizenId = await this.patientsRepository.findCitizenId(
          updatePatientDto.citizen_id,
        );

        // Nếu đã tồn tại và không phải chính bệnh nhân đang update thì báo lỗi
        if (
          existedCitizenId &&
          existedCitizenId.patient_account_id !== patient.patient_account_id
        ) {
          throw new BadRequestException('CCCD đã tồn tại!');
        }
      }

      if (updatePatientDto.health_insurance_id) {
        const existedHealthInsuranceId =
          await this.patientsRepository.findHealthInsuranceId(
            updatePatientDto.health_insurance_id,
          );

        // Nếu đã tồn tại và không phải chính bệnh nhân đang update thì báo lỗi
        if (
          existedHealthInsuranceId &&
          existedHealthInsuranceId.patient_account_id !==
            patient.patient_account_id
        ) {
          throw new BadRequestException('BHYT đã tồn tại!');
        }
      }

      const updatedPatient = await this.patientsRepository.findOneAndUpdate(
        patient,
        {
          ...updatePatientDto,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      );

      if (!updatedPatient) {
        throw new NotFoundException(
          `Patient with patient_account_id ${patient_account_id} not updated`,
        );
      }

      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: string) {
    if (!id) {
      throw new NotFoundException('Invalid id');
    }

    try {
      const patient = await this.patientsRepository.findOne({ _id: id });

      if (!patient) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }

      const deletedPatient = await this.patientsRepository.findOneAndDelete({
        _id: id,
      });

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

  async getPatientById(id: string) {
    if (!id) {
      throw new NotFoundException('Invalid id');
    }

    try {
      const patient = await this.patientsRepository.findOne({ _id: id });

      if (!patient) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }

      return {
        data: {
          id: patient._id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          citizen_id: patient.citizen_id,
          health_insurance_id: patient.health_insurance_id,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ? patient.address2 : 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
          medical_history: {
            allergies: patient.medical_history.allergies,
            personal_history: patient.medical_history.personal_history,
            family_history: patient.medical_history.family_history,
          },
        },
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByFullName(fullName: string) {
    if (!fullName) {
      throw new NotFoundException('Invalid fullName');
    }

    try {
      const patients = await this.patientsRepository.find({
        fullname: fullName,
      });

      if (!patients || patients.length === 0) {
        throw new NotFoundException(`Patient with name ${fullName} not found`);
      }

      return {
        data: patients.map((patient) => ({
          id: patient._id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          citizen_id: patient.citizen_id,
          health_insurance_id: patient.health_insurance_id,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ?? 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
          medical_history: {
            allergies: patient.medical_history.allergies,
            personal_history: patient.medical_history.personal_history,
            family_history: patient.medical_history.family_history,
          },
        })),
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByPhoneNumber(phoneNumber: string) {
    if (!phoneNumber) {
      throw new NotFoundException('Invalid phoneNumber');
    }

    try {
      const patient = await this.patientsRepository.findOne({
        phone: phoneNumber,
      });

      if (!patient) {
        throw new NotFoundException(
          `Patient with phone ${phoneNumber} not found`,
        );
      }

      return {
        data: {
          id: patient._id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          citizen_id: patient.citizen_id,
          health_insurance_id: patient.health_insurance_id,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ? patient.address2 : 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
          medical_history: {
            allergies: patient.medical_history.allergies,
            personal_history: patient.medical_history.personal_history,
            family_history: patient.medical_history.family_history,
          },
        },
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByCid(cid: string) {
    if (!cid) {
      throw new NotFoundException('Invalid phoneNumber');
    }

    try {
      const patient = await this.patientsRepository.findOne({
        citizen_id: cid,
      });

      if (!patient) {
        throw new NotFoundException(`Patient with phone ${cid} not found`);
      }

      return {
        data: {
          id: patient._id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          citizen_id: patient.citizen_id,
          health_insurance_id: patient.health_insurance_id,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ? patient.address2 : 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
          medical_history: {
            allergies: patient.medical_history.allergies,
            personal_history: patient.medical_history.personal_history,
            family_history: patient.medical_history.family_history,
          },
        },
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByHid(hid: string) {
    if (!hid) {
      throw new NotFoundException('Invalid phoneNumber');
    }

    try {
      const patient = await this.patientsRepository.findOne({
        health_insurance_id: hid,
      });

      if (!patient) {
        throw new NotFoundException(`Patient with phone ${hid} not found`);
      }

      return {
        data: {
          id: patient._id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          citizen_id: patient.citizen_id,
          health_insurance_id: patient.health_insurance_id,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ? patient.address2 : 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
          medical_history: {
            allergies: patient.medical_history.allergies,
            personal_history: patient.medical_history.personal_history,
            family_history: patient.medical_history.family_history,
          },
        },
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getAllPatients() {
    try {
      const patients = await this.patientsRepository.find({});

      if (!patients || patients.length === 0) {
        throw new NotFoundException(`Không có hồ sơ bệnh nhân nào`);
      }

      return {
        data: patients.map((patient) => ({
          id: patient._id,
          patient_account_id: patient.patient_account_id,
          fullName: patient.fullname,
          relation: patient.relation,
          citizen_id: patient.citizen_id,
          health_insurance_id: patient.health_insurance_id,
          ethnicity: patient.ethnicity,
          marital_status: patient.marital_status,
          address1: patient.address1,
          address2: patient.address2 ?? 'Trống',
          phone: patient.phone,
          gender: patient.gender ? 'Nam' : 'Nữ',
          nation: patient.nation,
          work_address: patient.work_address,
          medical_history: {
            allergies: patient.medical_history.allergies,
            personal_history: patient.medical_history.personal_history,
            family_history: patient.medical_history.family_history,
          },
        })),
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async assignToClinic(patient_account_id: string, clinicId: string) {
    try {
      console.log('Assigning patient to clinic:', {
        patient_account_id,
        clinicId,
      });
      // Kiểm tra patient account có tồn tại không
      const patientAccount = await this.patientAccountRepo.repo.findOne({
        where: { id: patient_account_id },
      });

      if (!patientAccount) {
        throw new Error(`PatientAccount ${patient_account_id} not found`);
      }

      // Tạo bản ghi PatientClinicLink mới
      const link = this.patientClinicLinkRepo.repo.create({
        clinic_id: clinicId,
        patientAccount: patientAccount,
      });

      // Lưu vào DB
      await this.patientClinicLinkRepo.repo.save(link);

      return link;
    } catch (error) {
      console.error('Error assigning patient to clinic:', error);
      throw error;
    }
  }

  async getPatientClinics(id: string) {
    // Lấy list clinicIds
    const links = await this.patientClinicLinkRepo.repo.find({
      where: { patientAccount: { id } },
    });
    const clinicIds = links.map((link) => link.clinic_id);
    if (clinicIds.length === 0) return [];

    // Gửi request sang clinic-service
    const clinics = await firstValueFrom(
      this.clinicsHttpService.post('/clinics/get-clinics-by-ids', {
        clinicIds,
      }),
    );

    return clinics.data;
  }

  async getPatientAccount(id: string) {
    try {
      const patientAcount = await this.patientAccountRepo.findOne({ id: id });
      if (!patientAcount) {
        throw new NotFoundException('patientAcount not found');
      }
      return patientAcount;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientAccounts() {
    try {
      const patientAccounts = await this.patientAccountRepo.find({});
      if (!patientAccounts) {
        throw new NotFoundException('patientAccounts not found');
      }
      return patientAccounts;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
  async getPatientByAccountId(id: string) {
    try {
      const patient = await this.patientsRepository.findOne({
        patient_account_id: id,
      });
      return patient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Không có thì trả null thôi
        return null;
      }
      // Nếu lỗi khác thì mới throw
      throw error;
    }
  }
}
