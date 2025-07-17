import {
  Controller,
  Logger,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { StorePayOSCredentialsDto } from './dtos/store-credentials.dto';
import { CreatePaymentLinkDto } from './dtos/create-payment-link.dto';
import { WebhookType } from '@payos/node/lib/type';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('payos/credentials')
  async storePayOSCredentials(
    @Body() dto: StorePayOSCredentialsDto,
  ): Promise<{ message: string }> {
    await this.paymentService.storePayOSCredentials(dto);
    return { message: 'PayOS credentials stored successfully' };
  }

  @Post('payos/link')
  async createPayOSPaymentLink(@Body() dto: CreatePaymentLinkDto) {
    return this.paymentService.createPayOSPaymentLink(dto);
  }

  @Post('payos/webhook')
  @HttpCode(HttpStatus.OK)
  async processPayOSWebhook(
    @Body() webhookData: WebhookType,
  ): Promise<{ message: string }> {
    await this.paymentService.processPayOSWebhook(webhookData);
    return { message: 'Webhook processed' };
  }
}
