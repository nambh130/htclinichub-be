import { Entity, Column } from 'typeorm';
import { PostgresAbstractEntity } from '@app/common/databases/postgresql/abstract.entity';
import { PaymentMethod as PaymentMethodEnum, PaymentProvider } from '../enums';

@Entity('payment_methods')
export class PaymentMethod extends PostgresAbstractEntity<PaymentMethod> {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
  })
  type: PaymentMethodEnum;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  feeRate: number; // Fee percentage (e.g., 0.025 for 2.5%)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fixedFee: number; // Fixed fee amount

  @Column({ default: 1 })
  sortOrder: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxAmount: number;
}
