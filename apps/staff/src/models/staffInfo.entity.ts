import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, OneToMany, OneToOne, Unique } from 'typeorm';
import { Specialize } from './specialize.entity';
import { Degree } from './degree.entity';
import { Doctor } from './doctor.entity';

@Entity()
@Unique(['staff_id'])
export class StaffInfo extends PostgresAbstractEntity<StaffInfo> {
  @Column({ unique: true })
  staff_id: string;

  @Column()
  staff_type: 'doctor' | 'employee';

  @Column()
  full_name: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column()
  phone: string;

  @Column()
  gender: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  profile_img_id?: string;

  @OneToOne(() => Doctor, (doctor) => doctor.staff_info)
  doctor: Doctor;

  @OneToMany(() => Specialize, (specialize) => specialize.staff_info, {
    cascade: true,
    eager: true,
  })
  specializes: Specialize[];

  @OneToMany(() => Degree, (degree) => degree.staff_info, {
    cascade: true,
    eager: true,
  })
  degrees: Degree[];
}