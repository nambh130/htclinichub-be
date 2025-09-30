import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class FavouriteDoctor extends PostgresAbstractEntity<FavouriteDoctor> {
    // @PrimaryGeneratedColumn()
    // id: number;

    @Column()
    patient_id: string;

    @Column()
    doctor_id: string;

    // @OneToOne(() => Doctor, (doctor) => doctor.id)
    // doctor: Doctor;
}