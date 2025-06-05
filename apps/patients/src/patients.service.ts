import { Inject, Injectable } from '@nestjs/common';
import { CreatePatientDto } from '@app/common/dto/patients/create-patients.dto';
import { PatientRepository } from './patients.repository';
import { PATIENT_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { Patient } from './models';

@Injectable()
export class PatientsService {
  constructor(
    private readonly patientsRepository: PatientRepository,
    @Inject(PATIENT_SERVICE)
    private readonly PatientsClient: ClientKafka,
  ) {}

  async createPatient(createPatientDto: CreatePatientDto, userId: string) {
    // Validate các trường bắt buộc
    // if (
    //   !createPatientDto?.fullname ||
    //   !createPatientDto?.patient_account_id ||
    //   !createPatientDto?.phone ||
    //   !createPatientDto?.address1 ||
    //   createPatientDto?.gender === undefined ||
    //   !createPatientDto?.ethnicity ||
    //   !createPatientDto?.marital_status ||
    //   !createPatientDto?.nation ||
    //   !createPatientDto?.work_address ||
    //   !createPatientDto?.relation
    // ) {
    //   throw new Error('Invalid Patient data');
    // }

    const newPatient = new Patient();
    newPatient.fullname = createPatientDto.fullname;
    newPatient.patient_account_id = createPatientDto.patient_account_id;
    newPatient.phone = createPatientDto.phone;
    newPatient.address1 = createPatientDto.address1;
    newPatient.gender = createPatientDto.gender;
    newPatient.ethnicity = createPatientDto.ethnicity;
    newPatient.marital_status = createPatientDto.marital_status;
    newPatient.nation = createPatientDto.nation;
    newPatient.work_address = createPatientDto.work_address;
    newPatient.relation = createPatientDto.relation;
    newPatient.createdBy = userId;
    if (createPatientDto.address2) newPatient.address2 = createPatientDto.address2;

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

  // update(id: number, updatePatientDto: UpdatePatientDto) {
  //   return `This action updates a #${id} patient`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} patient`;
  // }
}
