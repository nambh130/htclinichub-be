import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Clinic } from './clinics.entity';

@Entity()
export class ClinicScheduleRule extends PostgresAbstractEntity<ClinicScheduleRule> {
    @Column({ type: 'interval' })
    duration: string;

    @Column({ type: 'int' })
    space: number; 
    
    @Column({ type: 'interval', nullable: true })
    open_time: string; 

    @Column({ type: 'interval', nullable: true })
    close_time: string; 

    @Column({ type: 'interval', nullable: true })
    break_time: string; 

    @OneToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id', referencedColumnName: 'id' })
    clinic: Clinic;
}
