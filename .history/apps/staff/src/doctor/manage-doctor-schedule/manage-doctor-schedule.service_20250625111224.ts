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
 
       if (!doctor) {
         throw new NotFoundException(`Doctor with id ${doctorId} not found`);
       }
 
       return {
       
     } catch (error) {
       console.error('Error retrieving patient:', error);
       throw error;
     }
   }
  
}