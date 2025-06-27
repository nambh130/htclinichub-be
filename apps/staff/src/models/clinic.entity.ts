import { BaseClinic } from '@app/common/modules/clinic/models/base-clinic.entity';
import { Entity, ManyToMany } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity({ name: 'clinic' })
export class Clinic extends BaseClinic {
  constructor(clinic?: Partial<Clinic>) {
    super();
    if (clinic) Object.assign(this, clinic);
  }

  //@ManyToOne(() => Doctor, (user) => user.ownerOf, { nullable: true })
  //@JoinColumn()
  //owner: Doctor;

  @ManyToMany(() => Doctor, (doctor) => doctor.clinics)
  users: Doctor[];
}
