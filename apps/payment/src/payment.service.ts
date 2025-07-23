import { Injectable, Logger } from '@nestjs/common';
import { PayOSService } from './providers/payos/payos.service';
import { StorePayOSCredentialsDto } from './dtos/store-credentials.dto';
import { CreatePaymentLinkDto } from './dtos/create-payment-link.dto';
import { WebhookType } from '@payos/node/lib/type';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly payosService: PayOSService) {}

  async storePayOSCredentials(dto: StorePayOSCredentialsDto): Promise<void> {
    // Store PayOS credentials for a clinic
    await this.payosService.storeCredentials(dto.clinicId, {
      clientId: dto.clientId,
      apiKey: dto.apiKey,
      checksumKey: dto.checksumKey,
    });
  }

  async updatePayOSCredentials(dto: StorePayOSCredentialsDto): Promise<void> {
    // Update PayOS credentials for a clinic
    await this.payosService.updateCredentials(dto.clinicId, {
      clientId: dto.clientId,
      apiKey: dto.apiKey,
      checksumKey: dto.checksumKey,
    });
  }

  async createPayOSPaymentLink(dto: CreatePaymentLinkDto) {
    // Create a payment link using PayOS
    return this.payosService.createPaymentLink(dto);
  }

  async processPayOSWebhook(webhookData: WebhookType): Promise<void> {
    // Process webhook from PayOS
    await this.payosService.processWebhook(webhookData);
  }
}
