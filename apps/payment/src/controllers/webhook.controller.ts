import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from '../payment.service';
import { PaymentProvider } from '../enums';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('vnpay')
  @HttpCode(HttpStatus.OK)
  async handleVnpayWebhook(
    @Body() webhookData: Record<string, unknown>,
    @Headers() _headers: Record<string, string>,
  ): Promise<{ message: string }> {
    this.logger.log('Received VNPAY webhook');

    try {
      await this.paymentService.handleWebhook(
        PaymentProvider.VNPAY,
        webhookData,
      );
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(
        `VNPAY webhook processing failed: ${(error as Error).message}`,
      );
      throw new BadRequestException('Webhook processing failed');
    }
  }

  @Post('momo')
  @HttpCode(HttpStatus.OK)
  async handleMomoWebhook(
    @Body() webhookData: Record<string, unknown>,
    @Headers() _headers: Record<string, string>,
  ): Promise<{ message: string }> {
    this.logger.log('Received MoMo webhook');

    try {
      await this.paymentService.handleWebhook(
        PaymentProvider.MOMO,
        webhookData,
      );
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(
        `MoMo webhook processing failed: ${(error as Error).message}`,
      );
      throw new BadRequestException('Webhook processing failed');
    }
  }

  @Post('onepay')
  @HttpCode(HttpStatus.OK)
  async handleOnepayWebhook(
    @Body() webhookData: Record<string, unknown>,
    @Headers() _headers: Record<string, string>,
  ): Promise<{ message: string }> {
    this.logger.log('Received OnePay webhook');

    try {
      await this.paymentService.handleWebhook(
        PaymentProvider.ONEPAY,
        webhookData,
      );
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(
        `OnePay webhook processing failed: ${(error as Error).message}`,
      );
      throw new BadRequestException('Webhook processing failed');
    }
  }

  @Post('zalopay')
  @HttpCode(HttpStatus.OK)
  async handleZaloPayWebhook(
    @Body() webhookData: Record<string, unknown>,
    @Headers() _headers: Record<string, string>,
  ): Promise<{ message: string }> {
    this.logger.log('Received ZaloPay webhook');

    try {
      await this.paymentService.handleWebhook(
        PaymentProvider.ZALOPAY,
        webhookData,
      );
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(
        `ZaloPay webhook processing failed: ${(error as Error).message}`,
      );
      throw new BadRequestException('Webhook processing failed');
    }
  }

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  async handleGenericWebhook(
    @Param('provider') provider: string,
    @Body() webhookData: Record<string, unknown>,
    @Headers() _headers: Record<string, string>,
  ): Promise<{ message: string }> {
    this.logger.log(`Received webhook for provider: ${provider}`);

    try {
      // Validate provider
      const providerEnum = provider.toUpperCase() as PaymentProvider;
      if (!Object.values(PaymentProvider).includes(providerEnum)) {
        throw new BadRequestException(`Unsupported provider: ${provider}`);
      }

      await this.paymentService.handleWebhook(providerEnum, webhookData);
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(
        `${provider} webhook processing failed: ${(error as Error).message}`,
      );
      throw new BadRequestException('Webhook processing failed');
    }
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  testWebhook(@Body() testData: unknown): {
    message: string;
    receivedData: unknown;
  } {
    this.logger.log('Received test webhook');

    return {
      message: 'Test webhook received successfully',
      receivedData: testData,
    };
  }
}
