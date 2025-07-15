import { PostgresAbstractEntity } from '@app/common';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'icd' })
export class ICD extends PostgresAbstractEntity<ICD> {

  @Column({ type: 'varchar', length: 10, nullable: false })
  code: string;

  @Column({ type: 'text', nullable: false })
  name: string;
}
