import { Injectable, NotFoundException } from '@nestjs/common';
import { DoctorRepository } from '../../repositories/doctor.repository';
import { ManageDoctorScheduleRepository } from './manage-doctor-schedule.repository';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ActorType, BaseService, TokenPayload } from '@app/common';
import { SetupWorkingShiftDto } from '@app/common/dto/staffs/doctor/setup-working-shift.dto';
import { Doctor_WorkShift } from '../../models/doctor_workshift.entity';
import { ClinicRepository } from '../../clinic/clinic.repository';
import { ChangeWorkingShiftDto } from '@app/common/dto/staffs/doctor/change-working-shift.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ManageDoctorScheduleService extends BaseService {
    constructor(
        private readonly manageDoctorScheduleRepository: ManageDoctorScheduleRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly clinicRepository: ClinicRepository,
    ) { super(); }

    async getViewWorkingShiftService(
        doctorId: string,
    ) {
        if (!doctorId) {
            throw new NotFoundException('Invalid doctorId');
        }

        try {
            const doctor = await this.doctorRepository.findOne({ id: doctorId });

            if (!doctor) {
                throw new NotFoundException(`Doctor with id ${doctorId} not found`);
            }

            const { data: shifts } = await this.manageDoctorScheduleRepository.findAll({
                where: {
                    doctor: {
                        id: doctor.id,
                    },
                },
                relations: {
                    clinic: true,
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
                    clinicName: shift.clinic?.name ?? null,
                })),
            };
        } catch (error) {
            console.error('Error retrieving working shifts:', error);
            throw error;
        }
    }

    async getDetailShiftService(shiftId: string) {
        try {
            const shift = await this.manageDoctorScheduleRepository.findOne(
                { id: shiftId },
                ['doctor', 'doctor.staff_info', 'doctor.staff_info.specializes', 'doctor.staff_info.degrees', 'clinic']
            );

            if (!shift) throw new Error('Shift not found');
            if (!shift.doctor) throw new Error('Doctor not found for shift');

            const doctor = shift.doctor;
            const info = doctor.staff_info;

            return {
                shiftId: shift.id,
                startTime: dayjs(shift.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm'),
                duration: shift.duration,
                isActivate: shift.isActivate,
                clinicName: shift.clinic?.name ?? null,
                doctor: {
                    id: doctor.id,
                    email: doctor.email,
                    fullName: info?.full_name || null,
                    dob: info?.dob || null,
                    gender: info?.gender || null,
                    phone: info?.phone || null,
                    specialize: info?.specializes?.map((spec) => ({
                        name: spec.name,
                        description: spec.description,
                    })) || [],

                    degree: info?.degrees?.map((deg) => ({
                        name: deg.name,
                        description: deg.description,
                    })) || [],
                    position: info?.position || null,
                    profilePicture: info?.profile_img_id || null,
                },
            };
        } catch (error) {
            console.error('Error retrieving shift detail:', error);
            throw new Error('Không thể lấy chi tiết ca trực');
        }
    }

    async setUpWorkingShiftByDoctorId(
        doctorId: string,
        dto: SetupWorkingShiftDto,
        currentUser: TokenPayload,
    ): Promise<Doctor_WorkShift> {
        // Lấy thông tin bác sĩ từ doctorId
        const doctor = await this.doctorRepository.findOne({ id: doctorId });
        if (!doctor) {
            throw new NotFoundException('Doctor not found');
        }

        // Lấy thông tin phòng khám
        const clinic = await this.clinicRepository.findOne({ id: dto.clinic });
        if (!clinic) {
            throw new NotFoundException('Clinic not found');
        }

        const workShift = new Doctor_WorkShift();
        workShift.doctor = doctor;
        workShift.clinic = clinic;
        workShift.startTime = new Date(dto.startTime);
        workShift.duration = dto.duration;
        workShift.createdById = currentUser.userId;
        workShift.createdByType = currentUser.actorType;

        return await this.manageDoctorScheduleRepository.create(workShift);
    }

    async changeWorkingShiftByDoctorId(
        dto: ChangeWorkingShiftDto,
        doctorId: string,
        shiftId: string,
        currentUser: TokenPayload,
    ): Promise<Doctor_WorkShift> {
        const doctor = await this.doctorRepository.findOne({ id: doctorId });
        if (!doctor) {
            throw new NotFoundException('Doctor not found');
        }

        const shift = await this.manageDoctorScheduleRepository.findOne({ id: shiftId });

        if (!shift) {
            throw new NotFoundException('Shift not found');
        }

        if (dto.startTime) {
            shift.startTime = new Date(dto.startTime);
        }

        if (dto.duration) {
            shift.duration = dto.duration;
        }

        if (dto.isActivate !== undefined) {
            shift.isActivate = dto.isActivate;
        }

        shift.updatedById = currentUser.userId;
        shift.updatedByType = currentUser.actorType;

        // 6. Lưu lại
        return await this.manageDoctorScheduleRepository.findOneAndUpdate(
            { id: shiftId },
            {
                ...(dto.startTime && { startTime: new Date(dto.startTime) }),
                ...(dto.duration && { duration: dto.duration }),
                ...(dto.isActivate !== undefined && { isActivate: dto.isActivate }),
                updatedById: currentUser.userId,
                updatedByType: currentUser.actorType,
            }
        );
    }
}

