import { Doctor } from '../models/doctor.entity';
import { StaffInfo } from '../models/staffInfo.entity';
import { StaffBasicInfo } from '@app/common';

// doctor-profile.mapper.ts
export function toDoctorProfile(doctor: Doctor, staffInfo: StaffInfo | null) {
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
      clinics:
        doctor.clinics?.map((clinicMap) => ({
          id: clinicMap.clinic?.id,
          name: clinicMap.clinic?.name,
          location: clinicMap.clinic?.location,
          phone: clinicMap.clinic?.phone,
          email: clinicMap.clinic?.email,
          ownerId: clinicMap.clinic?.ownerId,
        })) || [],
      staffInfo: staffInfo
        ? {
            id: staffInfo.id,
            full_name: staffInfo.full_name,
            social_id: staffInfo.social_id,
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
          }
        : null,
    },
  };
}

// Staff mapper function to convert StaffInfo to StaffBasicInfo
export function toStaffBasicInfo(
  staffInfo: StaffInfo | null,
): StaffBasicInfo | null {
  if (!staffInfo) return null;

  return {
    staff_id: staffInfo.staff_id,
    full_name: staffInfo.full_name,
    social_id: staffInfo.social_id,
    phone: staffInfo.phone,
    dob: staffInfo.dob,
    gender: staffInfo.gender,
    position: staffInfo.position,
    profile_img_id: staffInfo.profile_img_id,
  };
}
