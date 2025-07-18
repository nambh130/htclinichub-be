import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthModule } from '@api-gateway/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { httpClientConfig, HttpModules } from '@api-gateway/api/http.client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_CONSUMER_GROUP, PAYMENT_SERVICE } from '@app/common';

@Module({
  imports: [
    ConfigModule,
    HttpModules.registerAsync([
      httpClientConfig(
        PAYMENT_SERVICE,
        'PAYMENT_SERVICE_HOST',
        'PAYMENT_SERVICE_PORT',
      ),
    ]),
    ClientsModule.registerAsync([
      {
        name: PAYMENT_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'payment',
              brokers: [configService.get('KAFKA_BROKER')],
            },
            consumer: {
              groupId: PAYMENT_CONSUMER_GROUP,
            },
          },
        }),
      },
    ]),
    AuthModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
