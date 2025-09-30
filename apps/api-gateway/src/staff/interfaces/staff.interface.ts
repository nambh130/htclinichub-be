export interface IDoctorClinicLink {
  linkId: string;
  clinic: IClinic; // Full clinic object due to entity relationships
}

export interface IClinic {
  id: string;
  name: string;
  location: string;
  ownerId: string;
  // add other fields as needed
}

export interface IMappedClinicLink {
  link_id: string;
  clinic: {
    id: string;
    name: string;
    location: string;
    isAdmin: boolean;
  };
}
