import { PaymentProvider, PaymentMethod } from '../enums';

export interface PaymentConfig {
  provider: PaymentProvider;
  apiKey: string;
  secretKey: string;
  merchantId?: string;
  environment: 'sandbox' | 'production';
  baseUrl: string;
  callbackUrl: string;
  returnUrl: string;
  supportedMethods: PaymentMethod[];
  timeout?: number;
  currency: string;
}

export interface PaymentProviderConfig {
  [PaymentProvider.VNPAY]?: PaymentConfig;
  [PaymentProvider.MOMO]?: PaymentConfig;
  [PaymentProvider.ONEPAY]?: PaymentConfig;
  [PaymentProvider.ZALOPAY]?: PaymentConfig;
  [PaymentProvider.STRIPE]?: PaymentConfig;
  // Add more providers as needed
}
