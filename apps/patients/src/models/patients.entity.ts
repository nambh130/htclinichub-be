import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  patient_account_id: number;
  
  @Column({ length: 500 })
  fullname: string;

  @Column({ type: 'varchar', length: 255 })
  relation: string;

  @Column({ type: 'varchar', length: 255 })
  ethnicity: string;

  @Column({ type: 'varchar', length: 255 })
  marital_status: string;

  @Column({ type: 'varchar', length: 255 })
  address1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address2: string;

  @Column({ type: 'varchar', length: 255 })
  phone: string;

  @Column({ type: 'boolean'})
  gender: boolean;

  @Column({ type: 'varchar', length: 255 })
  nation: string;
  
  @Column({ type: 'varchar', length: 255 })
  work_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
