export interface PaymentConfig {
  [key: string]: string;
}

export interface CreatePaymentLinkRequest {
  clinicId: string;
  appointmentId?: string;
  orderCode: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  expiredAt?: number;
}

export interface CreatePaymentLinkResponse {
  paymentId: string;
  paymentLinkId: string;
  checkoutUrl: string;
  qrCode: string;
  amount: number;
  orderCode: string;
  status: string;
}

export interface PaymentProvider {
  storeCredentials(clinicId: string, credentials: PaymentConfig): Promise<void>;
  updateCredentials(
    clinicId: string,
    credentials: PaymentConfig,
  ): Promise<void>;
  createPaymentLink(
    request: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResponse>;
  processWebhook(webhookData: any): Promise<void>;
}
