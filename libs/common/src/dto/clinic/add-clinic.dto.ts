export interface AddClinicDto {
  name: string;
  location: string;
  ownerId: string; // Optional, if the clinic has an owner
}
