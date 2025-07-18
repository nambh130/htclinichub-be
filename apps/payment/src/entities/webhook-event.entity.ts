import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Payment } from './payment.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity('webhook_event')
@Index(['eventType'])
@Index(['processed'])
export class WebhookEvent extends PostgresAbstractEntity<WebhookEvent> {
  @ManyToOne(() => Payment, (payment) => payment.webhookEvents)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({ type: 'uuid' })
  paymentId: string;

  @Column({ type: 'varchar', length: 50 })
  eventType: string; // payment.success, payment.failed, etc.

  @Column({ type: 'jsonb' })
  eventData: Record<string, any>;

  @Column({ type: 'text' })
  signature: string;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;
}
