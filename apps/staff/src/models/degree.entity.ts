import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Degree extends PostgresAbstractEntity<Degree> {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => StaffInfo, (staffInfo) => staffInfo.specializes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;
  
  @ManyToOne(() => Image)
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
