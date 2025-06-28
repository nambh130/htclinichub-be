import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Image } from './image.entity';
import { Specialize } from './specialize.entity';
import { Degree } from './degree.entity';

@Entity()
@Unique(['staff_id'])
export class StaffInfo extends PostgresAbstractEntity<StaffInfo> {
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

  @OneToMany(() => Specialize, (specialize) => specialize.staff_info, {
    cascade: true,
    eager: true,
  })
  specializes: Specialize[];

  @OneToMany(() => Degree, (degrees) => degrees.staff_info, {
    cascade: true,
    eager: true,
  })
  degrees?: Degree;
}
