export interface StaffAccount {
  id: string;
  email: string;
  is_locked: boolean;
  clinic_id?: string;
}

export interface StaffBasicInfo {
  staff_id: string;
  full_name: string | null;
  social_id: string | null;
  dob: Date | null;
  phone: string | null;
  gender: string | null;
  position: string | null;
  profile_img_id: string | null;
  degrees?: Array<{
    id: string;
    name: string;
    level?: string;
    institution?: string;
    year?: number | null;
    description?: string | null;
    certificate_url?: string | null;
    image_id?: string | null;
  }>;
  specializes?: Array<{
    id: string;
    name: string;
    description?: string | null;
    certificate_url?: string | null;
    image_id?: string | null;
  }>;
}

export interface StaffMember {
  type: 'doctor' | 'employee';
  account: StaffAccount;
  info: StaffBasicInfo | null;
}

export interface StaffQueryResult {
  data: StaffMember[];
  total: number;
}

export interface GetClinicStaffQuery {
  type?: 'all' | 'doctor' | 'employee';
  search?: string;
  searchBy: 'all' | 'name' | 'email' | 'phone' | 'social_id';
  limit?: number;
  offset?: number;
}

export interface PaginatedStaffResponse {
  clinicId: string;
  data: {
    doctors: StaffMember[];
    employees: StaffMember[];
    allStaff: StaffMember[];
  };
  pagination: {
    total: number;
    totalDoctors: number;
    totalEmployees: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: GetClinicStaffQuery;
}
