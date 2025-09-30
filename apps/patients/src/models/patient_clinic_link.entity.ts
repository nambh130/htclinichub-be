import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { PatientAccount } from './patient_account.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
@Unique(['clinic_id', 'patientAccount']) // Chỉ cho phép 1 lần đăng ký mỗi phòng khám
export class PatientClinicLink extends PostgresAbstractEntity<PatientClinicLink> {
  @Column({ type: 'uuid' })
  clinic_id: string; // Clinic ở DB khác nên không relation, chỉ lưu UUID

  // Liên kết tới PatientAccount trong cùng DB
  @ManyToOne(() => PatientAccount)
  @JoinColumn({ name: 'patient_account_id' })
  patientAccount: PatientAccount;
}
