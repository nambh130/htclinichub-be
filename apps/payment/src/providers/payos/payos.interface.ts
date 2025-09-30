import { PaymentType } from '../../enums/payment-status.enum';

export interface PayOSCredentials {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

export interface PayOSCreatePaymentRequest {
  orderCode: number;
  amount: number;
  description: string;
  cancelUrl: string;
  returnUrl: string;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    type: PaymentType;
    appointmentId?: string;
    labOrderItemId?: string;
    labOrderId?: string;
  }>;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  expiredAt?: number;
}

export interface PayOSCreatePaymentResponse {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}
