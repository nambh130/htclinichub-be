export enum UserType {
  EMPLOYEE = "employee",
  DOCTOR = "doctor",
  PATIENT = "patient",
  // add other user types here
}

export interface TokenPayload {
  userId: string,
  userType: UserType,
  role?: string,
  isAdmin?: string
}
