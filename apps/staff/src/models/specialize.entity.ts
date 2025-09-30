import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Specialize extends PostgresAbstractEntity<Specialize> {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'certificate_url', nullable: true })
  certificate_url: string | null;

  @ManyToOne(() => StaffInfo, (staffInfo) => staffInfo.specializes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;

  @Column({ name: 'image_id', nullable: true })
  image_id: string | null;
}
