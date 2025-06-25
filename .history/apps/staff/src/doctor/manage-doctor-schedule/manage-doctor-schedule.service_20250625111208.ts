import {
    AUTH_SERVICE,
    STAFF_SERVICE,
} from '@app/common';
import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService{
  constructor(
    private readonly patientsRepository: PatientRepository,
    @Inject(PATIENT_SERVICE)
    private readonly PatientsClient: ClientKafka,
  ) { }

  async getViewWorkingShiftService(doctorId: string, userId: string) {
     if (!doctorId) {
       throw new NotFoundException('Invalid doctorId');
     }
 
     try {
       const doctor = await this.patientsRepository.findOne({ doctor_id: doctorId });
 
       if (!patient) {
         throw new NotFoundException(`Doctor with id ${doctorId} not found`);
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