export interface UpdateClinicDto {
  name: string;
  location: string;
  ownerId?: string; // Optional, if the clinic has an owner
  token?: string; // Optional, if the clinic has a token
}
