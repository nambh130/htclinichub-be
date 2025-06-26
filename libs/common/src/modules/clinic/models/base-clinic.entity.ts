import { Entity, Column } from 'typeorm';
import { PostgresAbstractEntity } from '@app/common';

export class BaseClinic extends PostgresAbstractEntity<BaseClinic> {
  constructor(clinic?: Partial<BaseClinic>) {
    super();
    if (clinic) Object.assign(this, clinic);
  }

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500 })
  location: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token?: string;
}
