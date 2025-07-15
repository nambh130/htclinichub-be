import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentProvider } from '../../enums';
import { PaymentProviderInterface } from './payment-provider.interface';
import { VnpayProvider } from './vnpay.provider';
import { MomoProvider } from './momo.provider';
import { OnepayProvider } from './onepay.provider';

@Injectable()
export class PaymentProviderFactory {
  private providers: Map<PaymentProvider, PaymentProviderInterface> = new Map();

  constructor(
    private readonly vnpayProvider: VnpayProvider,
    private readonly momoProvider: MomoProvider,
    private readonly onepayProvider: OnepayProvider,
  ) {
    this.registerProviders();
  }

  private registerProviders(): void {
    this.providers.set(PaymentProvider.VNPAY, this.vnpayProvider);
    this.providers.set(PaymentProvider.MOMO, this.momoProvider);
    this.providers.set(PaymentProvider.ONEPAY, this.onepayProvider);
    // Add more providers as needed
  }

  getProvider(providerType: PaymentProvider): PaymentProviderInterface {
    const provider = this.providers.get(providerType);

    if (!provider) {
      throw new BadRequestException(
        `Payment provider ${providerType} is not supported`,
      );
    }

    return provider;
  }

  getAllProviders(): PaymentProviderInterface[] {
    return Array.from(this.providers.values());
  }

  getSupportedProviders(): PaymentProvider[] {
    return Array.from(this.providers.keys());
  }

  isProviderSupported(providerType: PaymentProvider): boolean {
    return this.providers.has(providerType);
  }

  async validateProvider(providerType: PaymentProvider): Promise<boolean> {
    const provider = this.getProvider(providerType);
    return await provider.validateConfig();
  }
}
