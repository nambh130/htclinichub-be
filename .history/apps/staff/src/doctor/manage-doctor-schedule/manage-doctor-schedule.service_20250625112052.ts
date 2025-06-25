import {
    AUTH_SERVICE,
    STAFF_SERVICE,
} from '@app/common';
import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DoctorRepository } from '../doctor.repository';
import { ManageDoctorScheduleRepository } from './manage-doctor-schedule.repository';

@Injectable()
export class ManageDoctorScheduleService {
    constructor(
        private readonly manageDoctorScheduleRepository: ManageDoctorScheduleRepository,
        private readonly doctorRepository: DoctorRepository,
    ) { }

  async getViewWorkingShiftService(doctorId: string, userId: string) {
  if (!doctorId || isNaN(+doctorId)) {
    throw new NotFoundException('Invalid doctorId');
  }

  try {
    const doctor = await this.doctorRepository.findOne({ id: parseInt(doctorId) });

    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${doctorId} not found`);
    }

    const { data: shifts } = await this.manageDoctorScheduleRepository.findAll({
      where: {
        doctor: {
          id: doctor.id,
        },
      },
      order: {
        startTime: 'ASC',
      },
    });

    return {
      doctorId: doctor.id,
      totalShift: shifts.length,
      shifts: shifts.map((shift) => ({
        shiftId: shift.id,
        startTime: shift.startTime,
        duration: shift.duration,
        isActivate: shift.isActivate,
      })),
    };
  } catch (error) {
    console.error('Error retrieving working shifts:', error);
    throw error;
  }
}

}

