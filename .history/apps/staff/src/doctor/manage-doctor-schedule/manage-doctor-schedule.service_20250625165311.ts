import { Injectable, NotFoundException } from '@nestjs/common';
import { DoctorRepository } from '../../repositories/doctor.repository';
import { ManageDoctorScheduleRepository } from './manage-doctor-schedule.repository';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ManageDoctorScheduleService {
    constructor(
        private readonly manageDoctorScheduleRepository: ManageDoctorScheduleRepository,
        private readonly doctorRepository: DoctorRepository,
    ) { }

    async getViewWorkingShiftService(doctorId: string, userId: string) {
        if (!doctorId) {
            throw new NotFoundException('Invalid doctorId');
        }

        try {
            const doctor = await this.doctorRepository.findOne({ id: (doctorId) });

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
                    startTime: dayjs(shift.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm'),
                    duration: shift.duration,
                    isActivate: shift.isActivate,
                })),
            };
        } catch (error) {
            console.error('Error retrieving working shifts:', error);
            throw error;
        }
    }

    async getDetailShiftService(shiftId: string, userId: string) {
        try {
            const shift = await this.manageDoctorScheduleRepository.findOne(
                { id: shiftId },
                { doctor: { staff_info: true } },
            );

            const doctor = shift.doctor;
            const info = doctor.staff_info;

            return {
                shiftId: shift.id,
                startTime: dayjs(shift.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm'),
                duration: shift.duration,
                isActivate: shift.isActivate,
                doctor: {
                    id: doctor.id,
                    email: doctor.email,
                    fullName: info?.full_name,
                    dob: info?.dob,
                    gender: info?.gender,
                    phone: info?.phone,
                    specialize: info?.specializes,
                    degree: info?.degrees,
                    position: info?.position,
                    profilePicture: info?.image,
                },
            };
        } catch (error) {
            console.error('Error retrieving shift detail:', error);
            throw error;
        }
    }
}

