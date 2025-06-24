import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from './patients.entity';

@Entity()
export class FavouriteDoctor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    patient_id: number;

    @Column()
    doctor_id: number;

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

    @Column({ type: 'varchar', nullable: true })
    patientId: string;
}