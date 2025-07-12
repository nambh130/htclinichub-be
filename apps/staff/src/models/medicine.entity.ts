import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { PostgresAbstractEntity } from '@app/common';
import { DoctorClinicMap } from './doctor-clinic-map.entity';
import { Clinic } from './clinic.entity';

@Entity({ name: 'medicine' })
export class Medicine extends PostgresAbstractEntity<Medicine> {

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id' })
    clinic_id: Clinic;

    @Column({ name: 'code', type: 'varchar', length: 50 })
    code: string; // Mã thuốc

    @Column({ name: 'name', type: 'varchar', length: 255 })
    name: string; // Tên thuốc

    @Column({ name: 'concentration', type: 'varchar', length: 100 })
    concentration: string; // Hàm lượng

    @Column({ name: 'ingredient', type: 'varchar', length: 255 })
    ingredient: string; // Hoạt chất

    @Column({ name: 'unit', type: 'varchar', length: 50 })
    unit: string; // Đơn vị

    @Column({ name: 'quantity', type: 'int' })
    quantity: number; // Số lượng

    @Column({ name: 'times_per_day', type: 'int' })
    timesPerDay: number; // Lần/ngày

    @Column({ name: 'dose_per_time', type: 'varchar', length: 50 })
    dosePerTime: string; // Lượng/lần

    @Column({ name: 'schedule', type: 'varchar', length: 255 })
    schedule: string; // Lịch trình

    @Column({
        name: 'status',
        type: 'enum',
        enum: ['DANG_SU_DUNG', 'TAM_NGUNG', 'NGUNG_LUU_HANH'],
        default: 'DANG_SU_DUNG',
    })
    status: 'DANG_SU_DUNG' | 'TAM_NGUNG' | 'NGUNG_LUU_HANH';
}