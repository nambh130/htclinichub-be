import { STAFF_SERVICE, TokenPayload } from "@app/common";
import { ImportMedicineDto, UpdateMedicineDto } from "@app/common/dto/staffs/medicine";
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import FormData from 'form-data';

@Injectable()
export class MedicineService {
    constructor(
        @Inject('CLINIC_HTTP_SERVICE') private readonly httpService: HttpService,
    ) { }
    async importMedicineCsvHttp(file: Express.Multer.File, clinicId: string) {
        const form = new FormData();
        form.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const response = await firstValueFrom(
            this.httpService.post(`medicine/import-csv-to-medicine-data/${clinicId}`, form, {
                headers: form.getHeaders(),
            }
            ))
        return response.data;
    }

    async createMedicine(dto: ImportMedicineDto, clinicId: string, currentUser: TokenPayload) {
        const response = await firstValueFrom(
            this.httpService.post(`medicine/input-data-to-medicine-data/${clinicId}`, {
                dto,
                currentUser,
            }),
        );

        return response.data;
    }

    async getMedicineClinicId(clinicId: string, currentUser: TokenPayload) {
        const response = await firstValueFrom(
            this.httpService.get(`medicine/medicine-data/${clinicId}`));
        return response.data;
    }

    async searchMedicine(
        clinicId: string,
        currentUser: TokenPayload,
        search?: string, // 👈 thêm optional search param
    ) {
        // Build URL có hoặc không có search
        const url = search
            ? `medicine/search-medicine/${clinicId}?search=${encodeURIComponent(search)}`
            : `medicine/search-medicine/${clinicId}`;

        const response = await firstValueFrom(
            this.httpService.get(url),
        );

        return response.data;
    }

    async medicineInfo(clinicId: string, medicineInfo: string) {
        const response = await firstValueFrom(
            this.httpService.get(`medicine/medicine-info/${clinicId}/${medicineInfo}`));
        return response.data;
    }

    async medicineUpdate(clinicId: string, medicineId: string, dto: UpdateMedicineDto, currentUser: TokenPayload) {
        const response = await firstValueFrom(
            this.httpService.put(`medicine/${clinicId}/update-medicine/${medicineId}`, {
                dto,
                currentUser,
            }),
        );

        return response.data;
    }

    async exportMedicineDataToCSV(clinicId: string, currentUser: TokenPayload) {
        return firstValueFrom(
            this.httpService.get(`medicine/export_medicine_csv/${clinicId}`));
    }

    async getMedicineByCategory(
        clinicId: string,
        currentUser: TokenPayload,
        category?: string,   
    ) {
        // Build URL có hoặc không có search
        const url = category
            ? `medicine/filter-category/${clinicId}?category=${encodeURIComponent(category)}`
            : `medicine/filter-category/${clinicId}`;

        const response = await firstValueFrom(
            this.httpService.get(url),
        );

        return response.data;
    }
}