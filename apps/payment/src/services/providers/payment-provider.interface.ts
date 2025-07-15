import { PaymentProvider, PaymentStatus } from '../../enums';
import { CreatePaymentDto, PaymentCallbackDto } from '../../dto';
import { QRCodeData, QRCodeResponse } from '../../interfaces';

export interface PaymentResponse {
  paymentId: string;
  externalPaymentId?: string;
  status: PaymentStatus;
  paymentUrl?: string;
  qrCodeUrl?: string;
  qrCodeData?: string;
  expiresAt?: Date;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: any;
}

export interface PaymentStatusResponse {
  paymentId: string;
  externalPaymentId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  paidAt?: Date;
  failureReason?: string;
  rawResponse?: any;
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  message?: string;
  rawResponse?: any;
}

export abstract class PaymentProviderInterface {
  abstract readonly provider: PaymentProvider;

  // Core payment operations
  abstract createPayment(
    paymentData: CreatePaymentDto,
  ): Promise<PaymentResponse>;
  abstract getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
  abstract cancelPayment(paymentId: string): Promise<PaymentStatusResponse>;
  abstract refundPayment(
    paymentId: string,
    amount?: number,
  ): Promise<RefundResponse>;

  // QR Code operations
  abstract generateQRCode(qrData: QRCodeData): Promise<QRCodeResponse>;
  abstract validateQRCode(qrCodeData: string): Promise<boolean>;

  // Webhook operations
  abstract handleWebhook(webhookData: any): Promise<PaymentCallbackDto>;
  abstract verifyWebhookSignature(
    payload: string,
    signature: string,
  ): Promise<boolean>;

  // Configuration and validation
  abstract validateConfig(): Promise<boolean>;
  abstract isSupported(paymentMethod: string): boolean;

  // Helper methods
  abstract formatAmount(amount: number): number | string;
  abstract parseWebhookData(rawData: any): PaymentCallbackDto;
}
