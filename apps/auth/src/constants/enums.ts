export enum OtpPurpose {
  PATIENT_LOGIN = 'patient_login',
  DOCTOR_RESET_PASSWORD = 'doctor_reset_password',
  STAFF_RESET_PASSWORD = 'staff_reset_password',
  ADMIN_RESET_PASSWORD = 'admin_reset_password',
  VERIFY = 'verify',
}

export enum OtpTargetType {
  PHONE = 'phone',
  EMAIL = 'email',
}
