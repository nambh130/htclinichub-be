import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PostgresAbstractEntity } from '@app/common';
import { DoctorClinicMap } from './doctor-clinic-map.entity';

@Entity({ name: 'doctor_workshift' })
export class Doctor_WorkShift extends PostgresAbstractEntity<Doctor_WorkShift> {

    @ManyToOne(() => DoctorClinicMap, { nullable: false })
    @JoinColumn({ name: 'doctor_clinic_link_id' })
    doctor_clinic_link_id: DoctorClinicMap;

    @Column({ type: 'timestamp', name: 'start_time' })
    startTime: Date;

    @Column({ type: 'interval' })
    duration: string;

    @Column({
        type: 'enum',
        enum: ['available', 'booked', 'cancelled'],
        default: 'available'
    })
    status: 'available' | 'booked' | 'cancelled';

    @Column({ type: 'int', default: 0 })
    space: number;
}
