import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
// import { Clinic } from './clinic.entity';

@Entity({ name: 'doctor_workshift' })
export class Doctor_WorkShift extends abastract{

    @ManyToOne(() => Doctor, { nullable: false })
    @JoinColumn({ name: 'doctor_id' })
    doctor: Doctor;

    //   @ManyToOne(() => Clinic, { nullable: false })
    //   @JoinColumn({ name: 'clinic_id' })
    //   clinic: Clinic;

    @Column({ type: 'timestamp', name: 'start_time' })
    startTime: Date;

    @Column({ type: 'interval' }) // or 'int' if you're storing minutes/hours
    duration: string; // e.g. '02:00:00' for 2 hours

    @Column({ type: 'boolean', default: true })
    isActivate: boolean;
}
