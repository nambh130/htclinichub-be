import { PostgresAbstractEntity } from '@app/common';
import { AccountStatus, AccountStatusType } from '@app/common/enum/account-type.enum';
import { Entity, Column } from 'typeorm';

@Entity("patient")
export class Patient extends PostgresAbstractEntity<Patient> {
  constructor(patient?: Partial<Patient>) {
    super();
    if (patient) Object.assign(this, patient);
  }

  @Column({ unique: true })
  phone: string;


  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatusType;

  @Column({ nullable: true })
  password: string;
}
