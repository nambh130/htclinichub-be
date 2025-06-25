import {
  Entity,
  Column,
} from 'typeorm';
import { PostgresAbstractEntity } from '@app/common';

export class BaseClinic extends PostgresAbstractEntity<BaseClinic> {
  constructor(clinic?: Partial<BaseClinic>) {
    super();
    if (clinic) Object.assign(this, clinic);
  }

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;
}
