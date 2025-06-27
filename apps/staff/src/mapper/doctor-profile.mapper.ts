import { Doctor } from '../models/doctor.entity';
import { StaffInfo } from '../models/staffInfo.entity';

// doctor-profile.mapper.ts
export function toDoctorProfile(doctor: Doctor, staffInfo: StaffInfo) {
  return {
    account: {
      id: doctor.id,
      email: doctor.email,
      is_locked: doctor.is_locked,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
      createdById: doctor.createdById,
      updatedById: doctor.updatedById,
      deletedAt: doctor.deletedAt,
      invitations: doctor.invitations,
      services: doctor.services,
      clinics: doctor.clinics,
      staffInfo: {
        id: staffInfo.id,
        full_name: staffInfo.full_name,
        dob: staffInfo.dob,
        phone: staffInfo.phone,
        gender: staffInfo.gender,
        position: staffInfo.position,
        staff_type: staffInfo.staff_type,
        profile_img_id: staffInfo.profile_img_id,
        createdAt: staffInfo.createdAt,
        updatedAt: staffInfo.updatedAt,
        createdById: staffInfo.createdById,
        updatedById: staffInfo.updatedById,
        deletedAt: staffInfo.deletedAt,
        degrees: staffInfo.degrees,
        specializes: staffInfo.specializes,
      },
    },
  };
}
