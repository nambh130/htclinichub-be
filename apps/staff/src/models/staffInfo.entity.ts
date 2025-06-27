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
import { PostgresAbstractEntity } from '@app/common';

@Entity()
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

  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({ name: 'image_id' })
  image?: Image;

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
