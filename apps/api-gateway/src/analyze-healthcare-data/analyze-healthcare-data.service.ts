import { INPUT_VITAL_SIGNS_SERVICE, TokenPayload } from '@app/common';
import { InputVitalDto, UpdateVitalDto } from '@app/common/dto/analyze-healthcare-data';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyzeHealthcareDataService {
  constructor(@Inject(INPUT_VITAL_SIGNS_SERVICE) private readonly httpService: HttpService) { }

  async inputVital(
    inputVitalDto: InputVitalDto,
    currentUser: TokenPayload,
  ) {
    try {

      const payload = { inputVitalDto, currentUser };

      const result = await firstValueFrom(
        this.httpService.post('/analyze-healthcare/input-vital-signs-data', payload)
      );
      console.log('input Vital API-GATEWAY successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async getVitalSignsDataByPatientId(
    patientId: String,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/analyze-healthcare/get-vital-signs-data/${patientId}`)
      );
      console.log('input Vital API-GATEWAY successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

    async vitalSignsDataById(
    id: String,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/analyze-healthcare/get-vital-signs/${id}`)
      );
      console.log('input Vital API-GATEWAY successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updateVital(
    id: string,
    updateVitalDto: UpdateVitalDto,
    currentUser: TokenPayload,
  ) {
    try {

      const payload = {
        updateVitalDto,
        currentUser,
      };
      const result = await firstValueFrom(
        this.httpService.put(`/analyze-healthcare/update-vital-signs-data/:${id}`, payload)
      );
      // return {
      //   "Patient update successfully Patient Services": result,
      // };
      return result.data;
    } catch (error) {
      console.error('Error update patient:', error);
      throw error;
    }
  }

  async vitalInMRId(
    mRId: String,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/analyze-healthcare/vital-in-mRId/${mRId}`)
      );
      console.log('input Vital API-GATEWAY successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
}
