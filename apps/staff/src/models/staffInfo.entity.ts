import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { Specialize } from './specialize.entity';
import { Degree } from './degree.entity';

@Entity()
@Unique(['staff_id'])
export class StaffInfo extends PostgresAbstractEntity<StaffInfo> {
  @Column({ unique: true })
  staff_id: string;

  @Column()
  staff_type: 'doctor' | 'employee';

  @Column()
  full_name: string;

  @Column({ name: 'social_id', unique: true, nullable: true })
  social_id?: string;

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
