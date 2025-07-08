import { StaffInfo } from "./staff-details.interface";

export interface Appointment {
    id: string;
    date: string;
}

export interface Doctor {
    id: string;
    email: string;
    staffInfo?: StaffInfo | null;
}

export interface Clinic {
    id: string;
}

export interface MedicalRecord {
    _id: string;
    appointment: Appointment;
    doctor: Doctor;
    clinic: Clinic;
    symptoms: string;
    diagnosis: string;
    next_appointment: string;
}
