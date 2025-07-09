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
import { DoctorClinicRepo } from '../../repositories/doctor-clinic-map.repository';
import { Between } from 'typeorm';
import { spawn } from 'child_process';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ManageDoctorScheduleService extends BaseService {
  constructor(
    private readonly manageDoctorScheduleRepository: ManageDoctorScheduleRepository,
    private readonly doctorRepository: DoctorRepository,
    private readonly clinicRepository: ClinicRepository,
    private readonly doctorClinicRepo: DoctorClinicRepo,
  ) {
    super();
  }

  async getViewWorkingShiftService(doctorId: string) {
    if (!doctorId) {
      throw new NotFoundException('Invalid doctorId');
    }

    try {
      const doctor = await this.doctorRepository.findOne({ id: doctorId });

      if (!doctor) {
        throw new NotFoundException(`Doctor with id ${doctorId} not found`);
      }

      const { data: shifts } =
        await this.manageDoctorScheduleRepository.findAll({
          where: {
            doctor_clinic_link_id: {
              doctor: { id: doctor.id },
            },
          },
          relations: {
            doctor_clinic_link_id: {
              clinic: true,
            },
          },
          order: {
            startTime: 'ASC',
          },
        });

      return {
        doctorId: doctor.id,
        doctorName: doctor.staff_info?.full_name || null,
        totalShift: shifts.length,
        shifts: shifts.map((shift) => ({
          shiftId: shift.id,
          startTime: dayjs(shift.startTime)
            .tz('Asia/Ho_Chi_Minh')
            .format('DD/MM/YYYY HH:mm'),
          duration: shift.duration,
          space: shift.space || 0,
          status: shift.status,
          clinicName: shift.doctor_clinic_link_id?.clinic?.name ?? null,
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
        [
          'doctor_clinic_link_id',
          'doctor_clinic_link_id.doctor',
          'doctor_clinic_link_id.doctor.staff_info',
          'doctor_clinic_link_id.doctor.staff_info.specializes',
          'doctor_clinic_link_id.doctor.staff_info.degrees',
          'doctor_clinic_link_id.clinic',
        ],
      );

      if (!shift) throw new Error('Shift not found');

      const doctor = shift.doctor_clinic_link_id?.doctor;
      const info = doctor?.staff_info;
      const clinic = shift.doctor_clinic_link_id?.clinic;

      return {
        shiftId: shift.id,
        startTime: dayjs(shift.startTime)
          .tz('Asia/Ho_Chi_Minh')
          .format('DD/MM/YYYY HH:mm'),
        duration: this.formatDurationToString(shift.duration),
        clinicName: clinic?.name ?? null,
        space: shift.space || 0,
        status: shift.status || 'available',
        doctor: {
          id: doctor?.id,
          email: doctor?.email,
          fullName: info?.full_name || null,
          dob: info?.dob || null,
          gender: info?.gender || null,
          phone: info?.phone || null,
          specialize:
            info?.specializes?.map((spec) => ({
              name: spec.name,
              description: spec.description,
            })) || [],
          degree:
            info?.degrees?.map((deg) => ({
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
  ) {
    // Lấy thông tin bác sĩ từ doctorId
    const doctor = await this.doctorRepository.findOne({ id: doctorId });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const doctorClinicLink =
      await this.doctorClinicRepo.findLinkByDoctorAndClinic(
        dto.doctor_clinic_link_id,
      );
    if (!doctorClinicLink) {
      throw new NotFoundException('Doctor-clinic link not found');
    }

    const workShift = new Doctor_WorkShift();
    workShift.doctor_clinic_link_id = doctorClinicLink;
    workShift.startTime = new Date(dto.startTime);
    workShift.duration = dto.duration;
    workShift.space = dto.space || 0;
    workShift.createdById = currentUser.userId;
    workShift.createdByType = currentUser.actorType;
    //missing space
    workShift.space = dto.space;
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

    const shift = await this.manageDoctorScheduleRepository.findOne({
      id: shiftId,
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (dto.startTime) {
      shift.startTime = new Date(dto.startTime);
    }

    if (dto.duration) {
      shift.duration = dto.duration;
    }

    if (typeof dto.space === 'number' && dto.space >= 0) {
      shift.space = dto.space;
    }

    shift.updatedById = currentUser.userId;
    shift.updatedByType = currentUser.actorType;

    // 6. Lưu lại
    return await this.manageDoctorScheduleRepository.findOneAndUpdate(
      { id: shiftId },
      {
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.duration && { duration: dto.duration }),
        ...(dto.space && { space: dto.space }),
        updatedById: currentUser.userId,
        updatedByType: currentUser.actorType,
      },
    );
  }

  async getShiftsInDate(date: string, doctorId: string) {
    if (!doctorId || !date) {
      throw new NotFoundException('Missing doctorId or date');
    }

    const doctor = await this.doctorRepository.findOne({
      id: '43a9f8ee-8a4c-4a62-a49c-e2578f1b2c10',
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${doctorId} not found`);
    }

    const start = dayjs.tz(date, 'Asia/Ho_Chi_Minh').startOf('day').toDate();
    const end = dayjs.tz(date, 'Asia/Ho_Chi_Minh').endOf('day').toDate();

    const { data: shifts } = await this.manageDoctorScheduleRepository.findAll({
      where: {
        startTime: Between(start, end),
        doctor_clinic_link_id: {
          doctor: { id: '43a9f8ee-8a4c-4a62-a49c-e2578f1b2c10' },
        },
      },
      relations: {
        doctor_clinic_link_id: {
          clinic: true,
        },
      },
      order: {
        startTime: 'ASC',
      },
    });

    return {
      doctorId: doctor.id,
      doctorName: doctor.staff_info?.full_name ?? null,
      date: dayjs(date).format('DD/MM/YYYY'),
      totalShift: shifts.length,
      shifts: shifts.map((shift) => ({
        shiftId: shift.id,
        startTime: dayjs(shift.startTime)
          .tz('Asia/Ho_Chi_Minh')
          .format('HH:mm'),
        duration: shift.duration,
        space: shift.space || 0,
        status: shift.status,
        clinicName: shift.doctor_clinic_link_id?.clinic?.name ?? null,
      })),
    };
  }

  private formatDurationToString(
    duration: string | { hours?: number; minutes?: number; seconds?: number },
  ): string {
    let hours = 0,
      minutes = 0,
      seconds = 0;

    if (typeof duration === 'string') {
      const parts = duration.split(':');
      if (parts.length === 3) {
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
        seconds = parseInt(parts[2], 10) || 0;
      }
    } else if (typeof duration === 'object') {
      hours = duration.hours ?? 0;
      minutes = duration.minutes ?? 0;
      seconds = duration.seconds ?? 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  async getShiftsByDoctorIdAndClinicId(doctorId: string, clinicId: string) {
    // Tìm mapping giữa doctor và clinic
    const mapping = await this.doctorClinicRepo.findOne({
      doctor: { id: doctorId },
      clinic: { id: clinicId },
    });

    if (!mapping) {
      throw new NotFoundException('Doctor is not mapped to this clinic');
    }

    // Lấy danh sách ca làm việc theo mapping id
    const shifts =
      await this.manageDoctorScheduleRepository.findByDoctorClinicLink(
        mapping.id,
      );

    const result = shifts.map((shift) => ({
      shiftId: shift.id,
      startTime: shift.startTime,
      duration: this.formatDurationToString(shift.duration),
      space: shift.space,
      status: shift.status,
    }));

    return result;
  }

  async updateShifttFull(shiftId: string) {
    const shift = await this.manageDoctorScheduleRepository.findOne({ id: shiftId });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    return await this.manageDoctorScheduleRepository.findOneAndUpdate({ id: shiftId }, { status: 'fully-booked' });
  } 

  
}
