export type ActorType = 'doctor' | 'employee' | 'patient' | 'admin';

export type FileCategory = 'image' | 'pdf' | 'document' | 'other';

export type LabStatusType = 'collected' | 'in-process' | 'pending' | 'disposed';
export enum LabStatusEnum {
  DISPOSED = 'disposed',
  PENDING = 'pending',
  IN_PROCESS = 'in-process',
  COLLECTED = 'collected',
}
