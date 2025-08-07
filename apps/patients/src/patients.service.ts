import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from '@app/common/dto/patients/create-patients.dto';
import { UpdatePatientDto } from '@app/common/dto/patients/update-patient.dto';
import { PatientRepository } from './patients.repository';
import { CLINIC_SERVICE, PATIENT_SERVICE, TokenPayload } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { PatientAccount } from './models';
import { BadRequestException } from '@nestjs/common';
import { PatientAccountRepository } from './repositories/patient-account.repositoty';
import { PatientClinicLinkRepository } from './repositories/patient-clinic-link.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateAppointmentDto } from '@app/common/dto/appointment';
import { AppointmentRepository } from './repositories/appointment.repository';
import { Appointment } from './models/appointment.entity';
import { DataSource, In } from 'typeorm';
import { ICDRepository } from './repositories/icd.repository';
import { ManageMedicalRecordService } from './manage-medical-record/manage_medical_record.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PatientsService {
  // Service hosts and ports
  private readonly CLINIC_HOST: string;
  private readonly CLINIC_PORT: string;
  private readonly STAFF_HOST: string;
  private readonly STAFF_PORT: string;
  private readonly PATIENT_HOST: string;
  private readonly PATIENT_PORT: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly patientsRepository: PatientRepository,
    private readonly patientAccountRepo: PatientAccountRepository,
    private readonly patientClinicLinkRepo: PatientClinicLinkRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ICDRepository: ICDRepository,

    private readonly httpService: HttpService,
    private readonly manageMedicalRecordService: ManageMedicalRecordService,
    private readonly configService: ConfigService,
    @Inject(PATIENT_SERVICE)
    private readonly PatientsClient: ClientKafka,
    @Inject(CLINIC_SERVICE) private readonly clinicsHttpService: HttpService,
  ) {
    // Initialize service hosts and ports
    this.CLINIC_HOST = this.configService.get('CLINIC_SERVICE_HOST');
    this.CLINIC_PORT = this.configService.get('CLINIC_SERVICE_PORT');
    this.STAFF_HOST = this.configService.get('STAFF_SERVICE_HOST');
    this.STAFF_PORT = this.configService.get('STAFF_SERVICE_PORT');
    this.PATIENT_HOST = this.configService.get('PATIENT_SERVICE_HOST');
    this.PATIENT_PORT = this.configService.get('PATIENT_SERVICE_PORT');
  }

  async createPatient(
    createPatientDto: Partial<CreatePatientDto>,
    userId: string,
  ) {
    const existingMainProfiles = await this.patientsRepository.find({
      patient_account_id: createPatientDto.patient_account_id,
      relation: 'Chính chủ',
    });

    const hasMainProfile = existingMainProfiles.length > 0;

    if (createPatientDto.relation === 'Chính chủ' && hasMainProfile) {
      throw new BadRequestException(
        'Tài khoản này đã có hồ sơ "Chính chủ" rồi.',
      );
    }

    // if (createPatientDto.relation !== 'Chính chủ' && !hasMainProfile) {
    //   throw new BadRequestException(
    //     'Bạn cần tạo hồ sơ "Chính chủ" trước khi thêm hồ sơ phụ.',
    //   );
    // }

    // // Kiểm tra số điện thoại
    // const existedPhone = await this.patientsRepository.findByPhone(
    //   createPatientDto.phone,
    // );
    // if (existedPhone) {
    //   throw new BadRequestException('Số điện thoại đã tồn tại!');
    // }

    // Kiểm tra CCCD
    const existedCitizenId = await this.patientsRepository.findCitizenId(
      createPatientDto.citizen_id,
    );
    if (existedCitizenId) {
      throw new BadRequestException('CCCD đã tồn tại!');
    }

    // Kiểm tra BHYT
    if (createPatientDto.health_insurance_id) {
      const existedHealthInsuranceId =
        await this.patientsRepository.findHealthInsuranceId(
          createPatientDto.health_insurance_id,
        );
      if (existedHealthInsuranceId) {
        throw new BadRequestException('BHYT đã tồn tại!');
      }
    }

    // Tạo dữ liệu bệnh nhân
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
      bloodGroup: createPatientDto.bloodGroup,
      clinic_id: createPatientDto.clinic_id,
    };

    try {
      console.log('Creating patient with data:', patientData);
      const patient = await this.patientsRepository.createPatient(patientData);
      console.log('Patient saved:', patient);
      return patient;
    } catch (error) {
      console.error('Error saved patient:', error);
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
    patient_account_id: string, // chính là _id của hồ sơ cụ thể
    updatePatientDto: UpdatePatientDto,
    userId: string,
  ) {
    if (!patient_account_id) {
      throw new NotFoundException('Thiếu ID hồ sơ cần cập nhật');
    }

    try {
      // Lấy hồ sơ cụ thể đang cập nhật
      const currentProfile = await this.patientsRepository.findOne({
        _id: patient_account_id,
      });

      if (!currentProfile) {
        throw new NotFoundException(
          `Không tìm thấy hồ sơ với ID ${patient_account_id}`,
        );
      }

      const accountId = currentProfile.patient_account_id;

      // Lấy tất cả hồ sơ "Chính chủ" thuộc cùng tài khoản (accountId)
      const existingMainProfiles = await this.patientsRepository.find({
        patient_account_id: accountId,
        relation: 'Chính chủ',
      });

      const isCurrentProfileMain = currentProfile.relation === 'Chính chủ';
      const hasAnyMainProfile = existingMainProfiles.length > 0;

      // Loại trừ chính hồ sơ đang cập nhật ra khỏi danh sách hồ sơ chính chủ
      const otherMainProfiles = existingMainProfiles.filter(
        (p) => p._id.toString() !== currentProfile._id.toString(),
      );

      const hasOtherMainProfile = otherMainProfiles.length > 0;

      // ❌ Muốn cập nhật thành "Chính chủ" nhưng đã có hồ sơ chính chủ khác
      if (updatePatientDto.relation === 'Chính chủ' && hasOtherMainProfile) {
        throw new BadRequestException(
          'Tài khoản này đã có hồ sơ "Chính chủ" khác.',
        );
      }

      // ❌ Muốn cập nhật thành hồ sơ phụ nhưng không có hồ sơ Chính chủ nào
      // if (
      //   updatePatientDto.relation !== 'Chính chủ' &&
      //   !hasAnyMainProfile &&
      //   !isCurrentProfileMain
      // ) {
      //   throw new BadRequestException(
      //     'Tài khoản chưa có hồ sơ "Chính chủ", không thể cập nhật hồ sơ phụ.',
      //   );
      // }

      if (
        currentProfile.relation === 'Chính chủ' &&
        updatePatientDto.relation &&
        updatePatientDto.relation !== 'Chính chủ'
      ) {
        throw new BadRequestException(
          'Hồ sơ "Chính chủ" không được phép đổi thành quan hệ khác.',
        );
      }

      // Kiểm tra số điện thoại
      // if (updatePatientDto.phone) {
      //   const existedPhone = await this.patientsRepository.findByPhone(
      //     updatePatientDto.phone,
      //   );
      //   if (
      //     existedPhone &&
      //     existedPhone._id.toString() !== currentProfile._id.toString()
      //   ) {
      //     throw new BadRequestException('Số điện thoại đã tồn tại!');
      //   }
      // }

      // Kiểm tra CCCD
      if (updatePatientDto.citizen_id) {
        const existedCCCD = await this.patientsRepository.findCitizenId(
          updatePatientDto.citizen_id,
        );
        if (
          existedCCCD &&
          existedCCCD._id.toString() !== currentProfile._id.toString()
        ) {
          throw new BadRequestException('CCCD đã tồn tại!');
        }
      }

      // Kiểm tra BHYT
      if (updatePatientDto.health_insurance_id) {
        const existedBHYT = await this.patientsRepository.findHealthInsuranceId(
          updatePatientDto.health_insurance_id,
        );
        if (
          existedBHYT &&
          existedBHYT._id.toString() !== currentProfile._id.toString()
        ) {
          throw new BadRequestException('BHYT đã tồn tại!');
        }
      }

      // Thực hiện cập nhật
      const updated = await this.patientsRepository.findOneAndUpdate(
        currentProfile,
        {
          ...updatePatientDto,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      );

      if (!updated) {
        throw new NotFoundException(
          `Không thể cập nhật hồ sơ với ID ${patient_account_id}`,
        );
      }

      return updated;
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật:', err);
      throw err;
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
      throw new NotFoundException('Not found id');
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
          dOB: patient.dOB,
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
          bloodGroup: patient.bloodGroup,
        },
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientProfileById(id: string) {
    if (!id) {
      throw new NotFoundException('Not found id');
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
          dOB: patient.dOB,
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
          bloodGroup: patient.bloodGroup,
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
          bloodGroup: patient.bloodGroup,
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
          bloodGroup: patient.bloodGroup,
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
          bloodGroup: patient.bloodGroup,
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
          bloodGroup: patient.bloodGroup,
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
          bloodGroup: patient.bloodGroup,
        })),
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientProfileByAccountId(account_id: string) {
    if (!account_id) {
      throw new NotFoundException('Invalid account ID');
    }

    const patients = await this.patientsRepository.find({
      patient_account_id: account_id,
    });

    if (!patients || patients.length === 0) {
      throw new NotFoundException(
        `No patient records found for account ID ${account_id}`,
      );
    }

    return {
      data: patients.map((patient) => ({
        id: patient._id,
        patient_account_id: patient.patient_account_id,
        fullName: patient.fullname,
        relation: patient.relation,
        dOB: patient.dOB,
        citizen_id: patient.citizen_id,
        health_insurance_id: patient.health_insurance_id,
        marital_status: patient.marital_status,
        address1: patient.address1,
        address2: patient.address2 || 'Trống',
        phone: patient.phone,
        gender:
          typeof patient.gender === 'boolean'
            ? patient.gender
              ? 'Nam'
              : 'Nữ'
            : 'Không xác định',
        nation: patient.nation,
        work_address: patient.work_address,
        medical_history: {
          allergies: patient.medical_history?.allergies || [],
          personal_history: patient.medical_history?.personal_history || [],
          family_history: patient.medical_history?.family_history || [],
        },
        bloodGroup: patient.bloodGroup,
      })),
    };
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
      await this.patientClinicLinkRepo.repo.upsert(link, [
        'clinic_id',
        'patientAccount',
      ]);

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
      const patient = await this.patientsRepository.find({
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

  async getPatientsWithoutAccount(clinicId: string) {
    const patients = await this.patientsRepository.find({
      patient_account_id: { $exists: false },
      clinic_id: clinicId,
    });
    return patients;
  }

  async getShiftById(shiftId: string) {
    const url = `http://${this.STAFF_HOST}:${this.STAFF_PORT}/manage-doctor-schedule/detail-working-shift/${shiftId}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data; // data từ staff service trả về
  }
  async updateShiftToFullyBook(shiftId: string) {
    console.log(shiftId);
    const url = `http://${this.STAFF_HOST}:${this.STAFF_PORT}/manage-doctor-schedule/doctor/shift/${shiftId}/status/fully-booked`;
    const response = await firstValueFrom(this.httpService.put(url));
    return response.data; // data từ staff service trả về
  }

  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    user: TokenPayload,
  ) {
    // Lấy shift info từ staff service qua HTTP
    const shift = await this.getShiftById(createAppointmentDto.slot_id);

    if (!shift) {
      throw new NotFoundException('Không tìm thấy ca khám');
    }

    // Đếm số lượng appointment hiện tại cho slot đó trong local DB
    const currentCount = await this.appointmentRepository.count({
      slot_id: createAppointmentDto.slot_id,
    });

    if (currentCount >= shift.space) {
      throw new BadRequestException('Ca khám này đã đầy chỗ.');
    }

    // Tạo mới appointment
    const appointment = new Appointment();
    appointment.patient_profile_id = createAppointmentDto.patient_profile_id;
    appointment.clinic_id = createAppointmentDto.clinic_id;
    appointment.doctor_id = createAppointmentDto.doctor_id;
    appointment.slot_id = createAppointmentDto.slot_id;
    appointment.reason = createAppointmentDto.reason;
    appointment.symptoms = createAppointmentDto.symptoms;
    appointment.note = createAppointmentDto.note ?? null;
    appointment.examFee = createAppointmentDto.examFee;
    appointment.createdById = user.userId.toString();
    appointment.createdByType = user.actorType;
    appointment.status = 'pending';
    await this.appointmentRepository.create(appointment);

    // // ✅ Option: nếu currentCount + 1 >= space thì gửi 1 HTTP PUT sang staff để cập nhật status slot
    if (currentCount + 1 >= shift.space) {
      await this.updateShiftToFullyBook(shift.shiftId);
    }

    return appointment;
  }

  async getAppointmentsWithDetailsByAccountId(accountId: string) {
    const profiles = await this.getPatientByAccountId(accountId);
    if (!profiles || !profiles.length) return [];

    const profileIds = profiles.map((p) => p._id.toString());
    const appointments = await this.appointmentRepository.findMany({
      patient_profile_id: In(profileIds),
    });

    const results = await Promise.all(
      appointments.map(async (appointment) => {
        // Call các API detail song song
        const [clinicRes, doctorRes, slotRes, profileRes] = await Promise.all([
          firstValueFrom(
            this.httpService.get(
              `http://${this.CLINIC_HOST}:${this.CLINIC_PORT}/clinics/clinic/${appointment.clinic_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Clinic API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/staff/doctor/details/${appointment.doctor_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Doctor API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/manage-doctor-schedule/detail-working-shift/${appointment.slot_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Slot API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.PATIENT_HOST}:${this.PATIENT_PORT}/patient-service/get-patient-by-id/${appointment.patient_profile_id}`,
            ),
          )
            .then((res) => {
              console.log('Profile Response:', res.data);
              return res.data;
            })
            .catch((err) => {
              console.error('Profile API error:', err);
              return null;
            }),
        ]);

        return {
          id: appointment.id,
          reason: appointment.reason,
          symptoms: appointment.symptoms,
          status: appointment.status,
          note: appointment.note,
          createdAt: appointment.createdAt,
          clinic: clinicRes,
          doctor: doctorRes,
          slot: slotRes,
          profile: profileRes,
        };
      }),
    );

    return results;
  }

  async getAppointment(appoinmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      id: appoinmentId,
    });
    if (!appointment) {
      throw new NotFoundException('Không tìm thấy appointment');
    }

    const [clinicRes, doctorRes, slotRes, profileRes] = await Promise.all([
      firstValueFrom(
        this.httpService.get(
          `http://${this.CLINIC_HOST}:${this.CLINIC_PORT}/clinics/clinic/${appointment.clinic_id}`,
        ),
      ).then((res) => res.data),

      firstValueFrom(
        this.httpService.get(
          `http://${this.STAFF_HOST}:${this.STAFF_PORT}/staff/doctor/details/${appointment.doctor_id}`,
        ),
      ).then((res) => res.data),

      firstValueFrom(
        this.httpService.get(
          `http://${this.STAFF_HOST}:${this.STAFF_PORT}/manage-doctor-schedule/detail-working-shift/${appointment.slot_id}`,
        ),
      ).then((res) => res.data),

      firstValueFrom(
        this.httpService.get(
          `http://${this.PATIENT_HOST}:${this.PATIENT_PORT}/patient-service/get-patientProfile-by-id/${appointment.patient_profile_id}`,
        ),
      ).then((res) => res.data),
    ]);

    return {
      id: appointment.id,
      reason: appointment.reason,
      symptoms: appointment.symptoms,
      status: appointment.status,
      note: appointment.note,
      createdAt: appointment.createdAt,
      clinic: clinicRes,
      doctor: doctorRes,
      slot: slotRes,
      profile: profileRes,
    };
  }

  async cancelAppointment(appoinmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      id: appoinmentId,
    });
    if (!appointment) throw new Error('Appointment not found');

    const result = await this.appointmentRepository.update(appointment, {
      status: 'cancel',
    });
    return result;
  }
  async startAppointment(appoinmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      id: appoinmentId,
    });
    if (!appointment) throw new Error('Appointment not found');

    const result = await this.appointmentRepository.update(appointment, {
      status: 'in_progress',
    });

    const data = {
      patient_id: appointment.patient_profile_id,
      appointment_id: appointment.id,
    };
    const medicalRecord =
      await this.manageMedicalRecordService.createMedicalRecord(data);

    return {
      message: 'Appointment started and medical record created',
      appointment: result, // trả về luôn appointment sau khi update
      medicalRecord: medicalRecord, // trả về medical record
    };
  }
  async doneAppointment(appoinmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      id: appoinmentId,
    });
    if (!appointment) throw new Error('Appointment not found');

    const result = await this.appointmentRepository.update(appointment, {
      status: 'done',
    });
    return result;
  }
  async getPendingAppointments(patientAccountId: string) {
    const profiles = await this.getPatientByAccountId(patientAccountId);
    if (!profiles || !profiles.length) return [];

    const profileIds = profiles.map((p) => p._id.toString());
    const appointments = await this.appointmentRepository.findMany({
      patient_profile_id: In(profileIds),
      status: 'pending',
    });

    const result = await Promise.all(
      appointments.map(async (appointment) => {
        const [clinicRes, doctorRes, slotRes, profileRes] = await Promise.all([
          firstValueFrom(
            this.httpService.get(
              `http://${this.CLINIC_HOST}:${this.CLINIC_PORT}/clinics/clinic/${appointment.clinic_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Clinic API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/staff/doctor/details/${appointment.doctor_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Doctor API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/manage-doctor-schedule/detail-working-shift/${appointment.slot_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Slot API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.PATIENT_HOST}:${this.PATIENT_PORT}/patient-service/get-patientProfile-by-id/${appointment.patient_profile_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Profile API error:', err);
              return null;
            }),
        ]);
        return {
          id: appointment.id,
          reason: appointment.reason,
          symptoms: appointment.symptoms,
          status: appointment.status,
          note: appointment.note,
          createdAt: appointment.createdAt,
          clinic: clinicRes,
          doctor: doctorRes,
          slot: slotRes,
          profile: profileRes,
        };
      }),
    );
    return result;
  }

  async getDoneAppointments(patientAccountId: string) {
    const profiles = await this.getPatientByAccountId(patientAccountId);
    if (!profiles || !profiles.length) return [];

    const profileIds = profiles.map((p) => p._id.toString());
    const appointments = await this.appointmentRepository.findMany({
      patient_profile_id: In(profileIds),
      status: 'done',
    });

    const result = await Promise.all(
      appointments.map(async (appointment) => {
        const [clinicRes, doctorRes, slotRes, profileRes] = await Promise.all([
          firstValueFrom(
            this.httpService.get(
              `http://${this.CLINIC_HOST}:${this.CLINIC_PORT}/clinics/clinic/${appointment.clinic_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Clinic API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/staff/doctor/details/${appointment.doctor_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Doctor API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/manage-doctor-schedule/detail-working-shift/${appointment.slot_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Slot API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.PATIENT_HOST}:${this.PATIENT_PORT}/patient-service/get-patientProfile-by-id/${appointment.patient_profile_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Profile API error:', err);
              return null;
            }),
        ]);
        return {
          id: appointment.id,
          reason: appointment.reason,
          symptoms: appointment.symptoms,
          status: appointment.status,
          note: appointment.note,
          createdAt: appointment.createdAt,
          clinic: clinicRes,
          doctor: doctorRes,
          slot: slotRes,
          profile: profileRes,
        };
      }),
    );
    return result;
  }

  async getAppointmentByDoctorClinicLink(doctor_id: string, clinic_id: string) {
    const appointments = await this.appointmentRepository.findMany({
      clinic_id: clinic_id,
      doctor_id: doctor_id,
    });

    const result = await Promise.all(
      appointments.map(async (appointment) => {
        const [clinicRes, doctorRes, slotRes, profileRes] = await Promise.all([
          firstValueFrom(
            this.httpService.get(
              `http://${this.CLINIC_HOST}:${this.CLINIC_PORT}/clinics/clinic/${appointment.clinic_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Clinic API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/staff/doctor/details/${appointment.doctor_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Doctor API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.STAFF_HOST}:${this.STAFF_PORT}/manage-doctor-schedule/detail-working-shift/${appointment.slot_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Slot API error:', err);
              return null;
            }),

          firstValueFrom(
            this.httpService.get(
              `http://${this.PATIENT_HOST}:${this.PATIENT_PORT}/patient-service/get-patientProfile-by-id/${appointment.patient_profile_id}`,
            ),
          )
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              console.error('Profile API error:', err);
              return null;
            }),
        ]);
        return {
          id: appointment.id,
          reason: appointment.reason,
          symptoms: appointment.symptoms,
          status: appointment.status,
          note: appointment.note,
          createdAt: appointment.createdAt,
          clinic: clinicRes,
          doctor: doctorRes,
          slot: slotRes,
          profile: profileRes,
        };
      }),
    );
    return result;
  }

  async createPatientAccount(payload: { id: string; phone: string }) {
    const phone = payload.phone;
    const patientAccount = new PatientAccount();
    patientAccount.id = payload.id;
    patientAccount.phone = phone;
    const patient = await this.patientAccountRepo.create(patientAccount);
    return patient;
  }

  async searchICD(keyword: string, limit: number) {
    return await this.ICDRepository.createQueryBuilder('icd')
      .where('icd.code ILIKE :keyword OR icd.name ILIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .orderBy('icd.code', 'ASC')
      .limit(limit)
      .getMany();
  }

  async checkProfileByAccountId(accountId: string) {
    if (!accountId) {
      throw new BadRequestException('Invalid accountId');
    }

    const profile = await this.patientsRepository.find({
      patient_account_id: accountId,
    });

    if (profile.length === 0) {
      return 0;
    } else {
      return 1;
    }
  }
}
