import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Specialize extends PostgresAbstractEntity<Specialize> {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => StaffInfo, (staffInfo) => staffInfo.specializes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;

  @Column({ name: 'image_id' })
  image_id: string;
}