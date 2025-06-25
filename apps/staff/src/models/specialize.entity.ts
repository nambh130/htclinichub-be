import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { Image } from './image.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Specialize extends PostgresAbstractEntity<Specialize> {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToOne(() => StaffInfo, (staffInfo) => staffInfo.specializes)
  @JoinColumn({ name: 'staff_info_id' })
  employee_info: StaffInfo;

  @ManyToOne(() => Image)
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
