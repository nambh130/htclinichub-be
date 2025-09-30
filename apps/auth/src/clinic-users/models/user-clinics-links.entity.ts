import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './clinic-user.entity';
import { Clinic } from '../../clinics/models/clinic.entity';

@Entity({ name: 'user_clinic_links' })
@Unique(['user', 'clinic'])
export class UserClinicLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToOne(() => Clinic, (clinic) => clinic.id)
  @JoinColumn({ name: 'clinic' })
  clinic: Clinic;
}
