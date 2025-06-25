import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ClinicUser } from './clinic-user.entity';
import { Clinic } from '../../clinics/models/clinic.entity';

@Entity({ name: 'user_clinic_links' })
@Unique(['user', 'clinic'])
export class UserClinicLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClinicUser, (user) => user.id)
  @JoinColumn({ name: 'user' })
  user: ClinicUser;

  @ManyToOne(() => Clinic, (clinic) => clinic.id)
  @JoinColumn({ name: 'clinic' })
  clinic: Clinic;
}
