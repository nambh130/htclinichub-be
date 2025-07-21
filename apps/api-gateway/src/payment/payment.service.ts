import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PAYMENT_SERVICE } from '@app/common';
import { firstValueFrom } from 'rxjs';
import {
  StorePayOSCredentialsDto,
  CreatePaymentLinkDto,
} from './payment.types';
import { WebhookType } from '@payos/node/lib/type';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentHttpService: HttpService,
  ) {}

  async storePayOSCredentials(dto: StorePayOSCredentialsDto): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/credentials', dto),
    );
    return response.data;
  }

  async createPayOSPaymentLink(dto: CreatePaymentLinkDto): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/link', dto),
    );
    return response.data;
  }

  async processPayOSWebhook(webhookData: WebhookType): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/webhook', webhookData),
    );
    return response.data;
  }
}
