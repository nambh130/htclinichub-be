export interface Media {
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdByType: string;
  updatedById: string;
  updatedByType: string;
  isDeleted: boolean;
  publicId: string;
  name: string;
  type: string;
  url: string;
  domain: string;
  mimetype: string;
  originalName: string;
  size: number;
  deletedAt: string | null;
  deletedById: string | null;
  deletedByType: string | null;
}

export interface DegreeOrSpecialize {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdByType: string;
  updatedById: string;
  updatedByType: string;
  deletedAt: string | null;
  deletedById: string | null;
  deletedByType: string | null;
  name: string;
  description: string;
  image_id: string | null;
  image: Media | null;
}

export interface StaffInfo {
  id: string;
  full_name: string;
  dob: string;
  phone: string;
  gender: string;
  position: string;
  staff_type: string;
  profile_img_id: string | null;
  profile_img: Media | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
  deletedAt: string | null;
  degrees: DegreeOrSpecialize[];
  specializes: DegreeOrSpecialize[];
}

export interface Account {
  id: string;
  email: string;
  is_locked: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
  deletedAt: string | null;
  invitations: unknown[];
  services: unknown[];
  clinics: unknown[];
  staffInfo: StaffInfo | null;
}

export interface StaffDetails {
  account: Account | null;
}
