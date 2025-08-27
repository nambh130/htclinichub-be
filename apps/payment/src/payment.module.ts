import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { PaymentConfig } from './entities/payment-config.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { EncryptionService } from './encryption/encryption.service';
import { PayOSService } from './providers/payos/payos.service';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentAnalyticsService } from './payment-analytics.service';
import Joi from 'joi';
import { PostgresDatabaseModule } from '@app/common/databases/postgresql';
import { LoggerModule } from '@app/common';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentConfigRepository } from './repositories/payment-config.repository';
import { PaymentTransactionRepository } from './repositories/payment-transaction.repository';
import { WebhookEventRepository } from './repositories/webhook-event.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PAYMENT_SERVICE_PORT: Joi.number().required(),
        PAYMENT_ENCRYPTION_KEY: Joi.string().length(32).required(),
        KAFKA_BROKER: Joi.required(),

        PAYMENT_SERVICE_DB: Joi.string().required(),

        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_SYNC: Joi.boolean().required(),
      }),
    }),
    LoggerModule,
    PostgresDatabaseModule.register('PAYMENT_SERVICE_DB'),
    PostgresDatabaseModule.forFeature([
      Payment,
      PaymentConfig,
      PaymentTransaction,
      WebhookEvent,
    ]),
  ],
  providers: [
    EncryptionService,
    PayOSService,
    PaymentService,
    PaymentAnalyticsService,
    PaymentRepository,
    PaymentConfigRepository,
    PaymentTransactionRepository,
    WebhookEventRepository,
  ],
  controllers: [PaymentController],
  exports: [
    PayOSService,
    EncryptionService,
    PaymentService,
    PaymentAnalyticsService,
    PaymentRepository,
    PaymentConfigRepository,
    PaymentTransactionRepository,
    WebhookEventRepository,
  ],
})
export class PaymentModule {}
