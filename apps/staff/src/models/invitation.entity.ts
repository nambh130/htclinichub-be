import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Doctor } from './doctor.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Invitation extends PostgresAbstractEntity<Invitation> {
  @Column()
  token: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.invitations)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
