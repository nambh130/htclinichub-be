import {
    AUTH_SERVICE,
    STAFF_SERVICE,
} from '@app/common';
import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DoctorRepository } from '../doctor.repository';

@Injectable()
export class ManageDoctorScheduleService{
  constructor(
    private readonly patientsRepository: PatientRepository,
        private readonly doctorRepository: DoctorRepository,
    @Inject(STAFF)
    private readonly PatientsClient: ClientKafka,
  ) { }

  async getViewWorkingShiftService(doctorId: string, userId: string) {
     if (!doctorId) {
       throw new NotFoundException('Invalid doctorId');
     }
 
     try {
       const doctor = await this.doctorRepository.findOne({ _id: doctorId });
 
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