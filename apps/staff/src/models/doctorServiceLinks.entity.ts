import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Service } from './service.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class DoctorServiceLink extends PostgresAbstractEntity<DoctorServiceLink> {
  @ManyToOne(() => Doctor, (doctor) => doctor.services)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Service, (service) => service.doctor_links)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
