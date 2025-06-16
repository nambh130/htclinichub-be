import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { Image } from './image.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Degree extends PostgresAbstractEntity<Degree> {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToOne(() => StaffInfo, (staffInfo) => staffInfo.degrees)
  @JoinColumn({ name: 'employee_info_id' })
  employee_info: StaffInfo;

  @ManyToOne(() => Image)
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
