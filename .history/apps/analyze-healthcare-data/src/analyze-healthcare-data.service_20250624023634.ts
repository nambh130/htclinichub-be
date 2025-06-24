import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { InputVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AnalyzeHealthcareDataRepository } from './analyze-healthcare-data.repository';
import { Types } from 'mongoose';

@Injectable()
export class AnalyzeHealthcareDataService {
  constructor(
    @Inject(INPUT_VITAL_SIGNS_SERVICE)
    private readonly INPUT_VITAL_SIGNS_Client: ClientKafka,
    private readonly analyzeHealthcareDataRepository: AnalyzeHealthcareDataRepository,

  ) { }

  async inputVital(
    inputVitalDto: InputVitalDto,
    userId: string,
  ) {
    try {
      const vitalsData = {
        spo2: inputVitalDto.spo2,
        heartRate: inputVitalDto.heartRate,
        respiratoryRate: inputVitalDto.respiratoryRate,
        temperature: inputVitalDto.temperature,
        bloodPressure: {
          systolic: inputVitalDto.bloodPressure.systolic,
          diastolic: inputVitalDto.bloodPressure.diastolic,
        },
        source: inputVitalDto.source,
        patientId: new Types.ObjectId(inputVitalDto.patientId)
      }

      const vitalsDataToDB = await this.analyzeHealthcareDataRepository.insertVitalSigns(vitalsData);
      console.log('Patient saved:', vitalsDataToDB);
      return vitalsDataToDB;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

   async getVitalSignsDataByPatientId(patientId: string, userId: string) {
      if (!patientId) {
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
            }
          }
        };
      } catch (error) {
        console.error('Error retrieving patient:', error);
        throw error;
      }
    }
}
