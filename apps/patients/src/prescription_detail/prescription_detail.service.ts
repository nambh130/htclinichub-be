import { Types } from "mongoose";
import { MedicalReportRepository } from "../manage-medical-record/manage_medical_record.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PatientRepository } from "../patients.repository";
import { PrescriptionRepository } from "./prescription_detail.repository";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { CreatePrescriptionDto } from "@app/common";

@Injectable()
export class PrescriptionService {
    constructor(
        private readonly manageMedicalReportRepository: MedicalReportRepository,
        private readonly patientRepository: PatientRepository,
        private readonly prescriptionRepository: PrescriptionRepository,
        private readonly appointmentRepository: AppointmentRepository,
    ) { }

    async getPrescriptionsByMRId(mRId: string) {
        try {
            const prescriptions = await this.prescriptionRepository.find({
                medical_record_id: new Types.ObjectId(mRId),
            });

            if (!prescriptions || prescriptions.length === 0) {
                return []; // Không có đơn thuốc nào cho appointment này
            }

            const medicalRecord = await this.manageMedicalReportRepository.findOne({ _id: mRId })

            if (!medicalRecord) {
                throw new Error('Medical record not found');
            }

            const appointment = await this.appointmentRepository.findOne({
                id: medicalRecord.appointment_id
            });

            if (!appointment) {
                throw new Error('Appointment not found');
            }

            const result = {
                medical_record_id: mRId,
                clinicId: appointment.clinic_id,
                prescriptions: prescriptions.map((prescription) => ({
                    _id: prescription._id.toString(),
                    prescribedMedicines: prescription.prescribedMedicines || [],
                    note: prescription.note || null,
                    createdAt: prescription.createdAt,
                    updatedAt: prescription.updatedAt,
                })),
            };
            return result;
        } catch (error) {
            console.error('Error in getPrescriptionsBymRId:', error);
            throw error;
        }
    }

    async createPrescription(
        mRId: string,
        createPrescriptionDto: CreatePrescriptionDto,
        user: string,
    ) {
        const medicalRecord = await this.manageMedicalReportRepository.findOne({ _id: mRId })

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        const prescriptionData = {
            medical_record_id: medicalRecord._id,
            prescribedMedicines: createPrescriptionDto.prescribedMedicines,
            note: createPrescriptionDto.note,
        };

        const prescription = await this.prescriptionRepository.createPrescription(prescriptionData);
        console.log('Prescription saved:', prescription);
        return prescription;
    }
}