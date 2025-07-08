import { Column, Entity } from 'typeorm';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Appointment extends PostgresAbstractEntity<Appointment> {
  @Column({ type: 'varchar', length: 50 })
  patient_profile_id: string; // reference tới MongoDB patient profile _id

  @Column({ type: 'uuid' })
  clinic_id: string;

  @Column({ type: 'uuid' })
  doctor_id: string;

  @Column({ type: 'uuid' })
  slot_id: string;

  @Column({ type: 'varchar', length: 500 })
  reason: string;

  @Column({ type: 'varchar', length: 500 })
  symptoms: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string | null;
}
