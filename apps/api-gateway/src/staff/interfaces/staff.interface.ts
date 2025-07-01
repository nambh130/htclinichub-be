export interface IDoctorClinicLink {
  linkId: string;
  clinic: string; // clinic ID
}

export interface IClinic {
  id: string;
  name: string;
  location: string;
  ownerOf: string;
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
