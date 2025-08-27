import { MedicineService } from '@api-gateway/clinics/medicine/medicine.service';
import {
  CreatePrescriptionDto,
  PATIENT_SERVICE,
  TokenPayload,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PrescriptionService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
    private readonly medicineService: MedicineService,
  ) {}

  async getPrescriptionsByMRId(mRId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`prescription/get-prescriptions-by-mRId/${mRId}`),
      );

      const data = response.data;
      const clinicId = data.clinicId;
      const prescriptions = data.prescriptions;

      for (const prescription of prescriptions) {
        const enrichedMedicines = [];

        for (const medicine of prescription.prescribedMedicines) {
          try {
            const detail = await this.medicineService.medicineInfo(
              clinicId,
              medicine.medicine_id,
            );

            enrichedMedicines.push({
              medicine_id: medicine.medicine_id,
              day: medicine.day,
              medicineCode: detail.code,
              medicineName: detail.name,
              ingredient: detail.ingredient,
              unit: detail.unit,
              madeIn: detail.madeIn,
              category: detail.category,
              concentration: detail.concentration,
              quantity: medicine.quantity,
              timesPerDay: medicine.timesPerDay,
              dosePerTime: medicine.dosePerTime,
              schedule: medicine.schedule,
            });
          } catch (err) {
            console.error(
              `❌ Không lấy được thông tin thuốc với ID=${medicine.medicine_id}:`,
              err.message,
            );

            enrichedMedicines.push(medicine);
          }
        }
        prescription.prescribedMedicines = enrichedMedicines;
      }

      return {
        medical_record_id: data.medical_record_id,
        clinicId,
        prescriptions,
      };
    } catch (error) {
      console.error('❌ Lỗi trong getPrescriptionsByMRId:', error);
      throw error;
    }
  }

  async createPrescription(
    mRId: string,
    createPrescriptionDto: CreatePrescriptionDto,
    user: string,
  ) {
    const result = await firstValueFrom(
      this.httpService.post(
        `prescription/create-prescription-by-mRId/${mRId}`,
        {
          createPrescriptionDto,
          user,
        },
      ),
    );
    return result.data;
  }
}
