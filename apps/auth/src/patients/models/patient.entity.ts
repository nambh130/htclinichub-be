import { PostgresAbstractEntity } from '@app/common';
import { Optional } from '@nestjs/common';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity("patient")
export class Patient extends PostgresAbstractEntity<Patient> {
  constructor(patient?: Partial<Patient>) {
    super();
    if (patient) Object.assign(this, patient);
  }

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  password: string;
}
