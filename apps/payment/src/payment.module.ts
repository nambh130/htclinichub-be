import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import * as Joi from 'joi';
import { LoggerModule, PostgresDatabaseModule } from '@app/common';

// Controllers
import { PaymentController } from './payment.controller';
import { WebhookController } from './controllers';

// Services
import { PaymentService } from './payment.service';
import { QRGeneratorService } from './services/qr-generator.service';

// Providers
import {
  PaymentProviderFactory,
  VnpayProvider,
  MomoProvider,
  OnepayProvider,
} from './services/providers';

// Entities
import { Payment, PaymentMethod, PaymentTransaction } from './entities';

// Repository
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PAYMENT_SERVICE_PORT: Joi.number().required(),
        KAFKA_BROKER: Joi.required(),

        PAYMENT_SERVICE_DB: Joi.string().required(),

        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_SYNC: Joi.boolean().required(),

        // Payment provider configurations
        // VNPAY
        VNPAY_TMN_CODE: Joi.string().optional(),
        VNPAY_SECRET_KEY: Joi.string().optional(),
        VNPAY_API_URL: Joi.string()
          .optional()
          .default('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
        VNPAY_QUERY_URL: Joi.string()
          .optional()
          .default(
            'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
          ),

        // MoMo
        MOMO_PARTNER_CODE: Joi.string().optional(),
        MOMO_ACCESS_KEY: Joi.string().optional(),
        MOMO_SECRET_KEY: Joi.string().optional(),
        MOMO_API_URL: Joi.string()
          .optional()
          .default('https://test-payment.momo.vn/v2/gateway/api/create'),
        MOMO_QUERY_URL: Joi.string()
          .optional()
          .default('https://test-payment.momo.vn/v2/gateway/api/query'),
        MOMO_STORE_ID: Joi.string().optional().default('HTClinicHub'),

        // OnePay
        ONEPAY_MERCHANT_ID: Joi.string().optional(),
        ONEPAY_ACCESS_CODE: Joi.string().optional(),
        ONEPAY_SECURE_SECRET: Joi.string().optional(),
        ONEPAY_API_URL: Joi.string()
          .optional()
          .default('https://mtf.onepay.vn/paygate/vpcpay.op'),
        ONEPAY_QUERY_URL: Joi.string()
          .optional()
          .default('https://mtf.onepay.vn/paygate/vpcpay.op'),

        // Application URLs
        BASE_URL: Joi.string().optional().default('http://localhost:3000'),
      }),
    }),
    LoggerModule,
    PostgresDatabaseModule.register('PAYMENT_SERVICE_DB'),
    TypeOrmModule.forFeature([Payment, PaymentMethod, PaymentTransaction]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PaymentController, WebhookController],
  providers: [
    PaymentService,
    QRGeneratorService,
    PaymentProviderFactory,
    VnpayProvider,
    MomoProvider,
    OnepayProvider,
    PaymentRepository,
  ],
  exports: [
    PaymentService,
    QRGeneratorService,
    PaymentProviderFactory,
    PaymentRepository,
  ],
})
export class PaymentModule {}
