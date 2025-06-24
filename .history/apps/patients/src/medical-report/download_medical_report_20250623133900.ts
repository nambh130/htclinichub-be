import { Inject, Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { firstValueFrom } from 'rxjs';
import { PatientsService } from '../patients.service';
import { ReportService } from './report.service';

@Injectable()
export class DownLoadMedicalReportService {
    constructor(
        private readonly patientService: PatientsService,
    ) { }

    async downloadMedicalReport(
        userId: string,
        patient_account_id: string,
    ) {
        try {
            const result = await this.patientService.getPatientById(patient_account_id, userId.toString());
            const patient = result.data;

            const pdfInput = {
                name: patient.fullName,
                dob: '1990-03-12', // bạn nên bổ sung thêm nếu DB có ngày sinh
                id: patient.id,
                date: new Date().toISOString().split('T')[0],
                diagnosis: 'Chưa cập nhật',
            };

            const reportService = new ReportService();
            // const pdfBuffer = await reportService.generatePdf(pdfInput);

            // Trả về buffer hoặc base64 (tuỳ client bạn dùng)
            return {
                filename: `medical-report-patient ${userId}.pdf`,
                // base64: pdfBuffer.toString('base64'),
            };
        } catch (error) {
            console.error('Error adding favorite doctor:', error);
            throw error;
        }
    }

}
