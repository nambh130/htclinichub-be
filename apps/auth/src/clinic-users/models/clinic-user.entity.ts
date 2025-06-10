import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserClinicLink } from './user-clinics-links.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity({ name: 'clinic_users' })
export class ClinicUser extends PostgresAbstractEntity<ClinicUser> {
  constructor(user?: Partial<ClinicUser>) {
    super();
    if (user) Object.assign(this, user);
  }

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  userType: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ManyToOne(() => ClinicUser)
  @JoinColumn({ name: 'owner_id' })
  owner?: ClinicUser;

  @OneToMany(() => UserClinicLink, (link) => link.clinic)
  userClinicLinks: UserClinicLink[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
