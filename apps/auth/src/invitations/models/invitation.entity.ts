import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clinic } from '../../clinics/models/clinic.entity';
import { ActorEnum, ActorType, ClinicUser } from '../../clinic-users/models/clinic-user.entity';
import { PostgresAbstractEntity } from '@app/common';
import { Role } from '../../roles/models/role.entity';

export type InvitationType = 'pending' | 'accepted' | 'expired' | 'revoked';
export enum InvitationEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

@Entity('employee_invitation')
export class EmployeeInvitation extends PostgresAbstractEntity<EmployeeInvitation> {
  constructor(invitation?: Partial<EmployeeInvitation>) {
    super();
    if (invitation) Object.assign(this, invitation);
  }

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'hashed_token', type: 'varchar', length: 64, unique: true })
  hashedToken: string;

  @ManyToOne(() => Clinic, { nullable: false })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: ActorEnum,
    default: 'doctor' //Please don't change this
  })
  actorType: ActorType;

  @ManyToOne(() => ClinicUser, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  invitedBy: ClinicUser;

  @Column({
    type: 'enum',
    enum: InvitationEnum,
    default: 'pending',
  })
  status: InvitationType;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at: Date;
}
