import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PatientAccount extends PostgresAbstractEntity<PatientAccount> {
  @Column({ length: 100, unique: true })
  phone: string;
}
