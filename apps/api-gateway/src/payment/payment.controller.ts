import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  StorePayOSCredentialsDto,
  CreatePaymentLinkDto,
} from './payment.types';
import { WebhookType } from '@payos/node/lib/type';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payos/credentials')
  async storePayOSCredentials(
    @Body() dto: StorePayOSCredentialsDto,
  ): Promise<unknown> {
    return this.paymentService.storePayOSCredentials(dto);
  }

  @Post('payos/link')
  async createPayOSPaymentLink(
    @Body() dto: CreatePaymentLinkDto,
  ): Promise<unknown> {
    return this.paymentService.createPayOSPaymentLink(dto);
  }

  @Post('payos/webhook')
  @HttpCode(HttpStatus.OK)
  async processPayOSWebhook(
    @Body() webhookData: WebhookType,
  ): Promise<unknown> {
    return this.paymentService.processPayOSWebhook(webhookData);
  }
}
