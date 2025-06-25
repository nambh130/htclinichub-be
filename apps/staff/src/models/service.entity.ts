import { Column, Entity, OneToMany } from 'typeorm';
import { DoctorServiceLink } from './doctorServiceLinks.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Service extends PostgresAbstractEntity<Service> {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  clinic_id: string;

  @OneToMany(() => DoctorServiceLink, (link) => link.service)
  doctor_links: DoctorServiceLink[];
}
