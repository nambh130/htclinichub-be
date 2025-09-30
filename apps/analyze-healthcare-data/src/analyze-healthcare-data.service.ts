import { AUTH_SERVICE, INPUT_VITAL_SIGNS_SERVICE } from '@app/common';
import { InputVitalDto, UpdateVitalDto } from '@app/common/dto/analyze-healthcare-data';
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

      console.log("mRID: ", inputVitalDto)

      const vitalsData = {
        spo2: inputVitalDto.spo2,
        heartRate: inputVitalDto.heartRate,
        respiratoryRate: inputVitalDto.respiratoryRate,
        temperature: inputVitalDto.temperature,
        weight: inputVitalDto.weight,
        height: inputVitalDto.height,
        bmi: inputVitalDto.bmi,
        glucoseLevel: {
          min: inputVitalDto.glucoseLevel.min,
          max: inputVitalDto.glucoseLevel.max,
        },
        bloodPressure: {
          systolic: inputVitalDto.bloodPressure.systolic,
          diastolic: inputVitalDto.bloodPressure.diastolic,
        },
        source: inputVitalDto.source,
        mRId: inputVitalDto.mRId ?? null,
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

  async getVitalSignsDataByPatientId(patientId: string) {
    if (!patientId) {
      throw new NotFoundException('Invalid patientId');
    }

    try {
      const vitalsData = await this.analyzeHealthcareDataRepository.findAndSort(
        { patientId: new Types.ObjectId(patientId) },
        { sort: { createdAt: -1 } }
      );
      if (!vitalsData || vitalsData.length === 0) {
        throw new NotFoundException(`No vitals found for patient with id ${patientId}`);
      }

      return {
        data: vitalsData.map(v => ({
          _id: v._id,
          patientId: v.patientId,
          spo2: v.spo2,
          heartRate: v.heartRate,
          respiratoryRate: v.respiratoryRate,
          temperature: v.temperature,
          weight: v.weight,
          height: v.height,
          bmi: v.bmi,
          glucoseLevel: {
            min: v.glucoseLevel?.min,
            max: v.glucoseLevel?.max,
          },
          bloodPressure: {
            systolic: v.bloodPressure?.systolic,
            diastolic: v.bloodPressure?.diastolic,
          },
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          source: v.source,
          mRId: v.mRId || null
        }))
      };

    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async vitalSignsDataById(id: string) {
    if (!id) {
      throw new NotFoundException('Invalid patientId');
    }

    try {
      const vitalsData = await this.analyzeHealthcareDataRepository.findOne({
        _id: new Types.ObjectId(id),
      });

      if (!vitalsData) {
        throw new NotFoundException(`Patient with id ${id} not found`);
      }

      return {
        data: {
          _id: vitalsData._id,
          patientId: vitalsData.patientId,
          spo2: vitalsData.spo2,
          heartRate: vitalsData.heartRate,
          respiratoryRate: vitalsData.respiratoryRate,
          temperature: vitalsData.temperature,
          weight: vitalsData.weight,
          height: vitalsData.height,
          bmi: vitalsData.bmi,
          glucoseLevel: {
            min: vitalsData.glucoseLevel?.min,
            max: vitalsData.glucoseLevel?.max,
          },
          bloodPressure: {
            systolic: vitalsData.bloodPressure?.systolic,
            diastolic: vitalsData.bloodPressure?.diastolic,
          },
          createdAt: vitalsData.createdAt,
          updatedAt: vitalsData.updatedAt,
          source: vitalsData.source,
          mRId: vitalsData.mRId || null
        },
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async updateVitalService(
    id: string,
    updateVitalDto: UpdateVitalDto,
    userId: string,
  ) {
    if (!id) {
      throw new NotFoundException('Invalid patientId');
    }

    try {
      // const patient = await this.patientsRepository.findOne({
      //   patient_account_id: parseInt(patient_account_id),
      // });

      // if (!patient) {
      //   throw new NotFoundException(`Patient with patient_account_id ${patient_account_id} not found`);
      // }

      const updateVitalData = await this.analyzeHealthcareDataRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        {
          ...updateVitalDto,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      );

      if (!updateVitalData) {
        throw new NotFoundException(`Patient with patientId ${id} not updated`);
      }

      return updateVitalData;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async vitalInMRId(mRId: string) {
    if (!mRId) {
      throw new NotFoundException('Invalid mRId');
    }

    try {
      const vitalsData = await this.analyzeHealthcareDataRepository.findOne({
        mRId: mRId,
      });

      if (!vitalsData) {
        throw new NotFoundException(`Patient with ${mRId} not found`);
      }

      return {
        data: {
          _id: vitalsData._id,
          patientId: vitalsData.patientId,
          spo2: vitalsData.spo2,
          heartRate: vitalsData.heartRate,
          respiratoryRate: vitalsData.respiratoryRate,
          temperature: vitalsData.temperature,
          weight: vitalsData.weight,
          height: vitalsData.height,
          bmi: vitalsData.bmi,
          glucoseLevel: {
            min: vitalsData.glucoseLevel?.min,
            max: vitalsData.glucoseLevel?.max,
          },
          bloodPressure: {
            systolic: vitalsData.bloodPressure?.systolic,
            diastolic: vitalsData.bloodPressure?.diastolic,
          },
          createdAt: vitalsData.createdAt,
          updatedAt: vitalsData.updatedAt,
          source: vitalsData.source,
          mRId: vitalsData.mRId || null
        },
      };
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
