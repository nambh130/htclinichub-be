import { OtpPurpose, OtpTargetType } from './enums';

export interface RequestOtpInput {
  target: string; // phone number or email
  type: OtpTargetType;
  purpose: OtpPurpose;
}
