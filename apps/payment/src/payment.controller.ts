import {
  Controller,
  Logger,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { StorePayOSCredentialsDto } from './dtos/store-credentials.dto';
import { CreatePaymentLinkDto } from './dtos/create-payment-link.dto';
import { CreateCashPaymentDto } from './dtos/create-cash-payment.dto';
import { WebhookType } from '@payos/node/lib/type';
import { GetPaymentsDto } from './dtos/get-payments.dto';
import { GetTransactionsDto } from './dtos/get-transactions.dto';
import { GetPaymentStatisticsDto } from './dtos/get-statistics.dto';
import { TokenPayload } from '@app/common';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  // ========================================
  // 🔐 PAYOS CREDENTIAL MANAGEMENT (CRUD)
  // ========================================

  /**
   * Create - Store new PayOS credentials for a clinic
   */
  @Post('payos/credentials')
  async storePayOSCredentials(
    @Body()
    payload: {
      dto: StorePayOSCredentialsDto;
      currentUser: TokenPayload;
    },
  ): Promise<{ message: string }> {
    await this.paymentService.storePayOSCredentials(
      payload.dto,
      payload.currentUser,
    );
    return { message: 'PayOS credentials stored successfully' };
  }

  /**
   * Read - Get PayOS credentials status for a clinic
   */
  @Get('payos/credentials/:clinicId/status')
  async getPayOSCredentialsStatus(
    @Param('clinicId') clinicId: string,
  ): Promise<{
    exists: boolean;
    isActive: boolean;
    lastUpdated?: Date;
  }> {
    return this.paymentService.getPayOSCredentialsStatus(clinicId);
  }

  /**
   * Read - Get and decrypt PayOS credentials for a clinic
   */
  @Get('payos/credentials/:clinicId')
  async getPayOSCredentials(@Param('clinicId') clinicId: string): Promise<{
    clientId: string;
    apiKey: string;
    checksumKey: string;
    isActive: boolean;
    lastUpdated?: Date;
  }> {
    return this.paymentService.getPayOSCredentials(clinicId);
  }

  /**
   * Update - Update existing PayOS credentials
   */
  @Put('payos/credentials')
  async updatePayOSCredentials(
    @Body()
    payload: {
      dto: StorePayOSCredentialsDto;
      currentUser: TokenPayload;
    },
  ): Promise<{ message: string }> {
    await this.paymentService.updatePayOSCredentials(
      payload.dto,
      payload.currentUser,
    );
    return { message: 'PayOS credentials updated successfully' };
  }

  /**
   * Update - Activate PayOS credentials for a clinic
   */
  @Put('payos/credentials/:clinicId/activate')
  async activatePayOSCredentials(
    @Body() payload: { dto: { clinicId: string }; currentUser: TokenPayload },
  ): Promise<{ message: string }> {
    await this.paymentService.activatePayOSCredentials(
      payload.dto.clinicId,
      payload.currentUser,
    );
    return { message: 'PayOS credentials activated successfully' };
  }

  /**
   * Update - Deactivate PayOS credentials for a clinic
   */
  @Put('payos/credentials/:clinicId/deactivate')
  async deactivatePayOSCredentials(
    @Body() payload: { dto: { clinicId: string }; currentUser: TokenPayload },
  ): Promise<{ message: string }> {
    await this.paymentService.deactivatePayOSCredentials(
      payload.dto.clinicId,
      payload.currentUser,
    );
    return { message: 'PayOS credentials deactivated successfully' };
  }

  /**
   * Delete - Permanently delete PayOS credentials for a clinic
   */
  @Delete('payos/credentials/:clinicId')
  async deletePayOSCredentials(
    @Param('clinicId') clinicId: string,
  ): Promise<{ message: string }> {
    await this.paymentService.deletePayOSCredentials(clinicId);
    return { message: 'PayOS credentials deleted successfully' };
  }

  /**
   * Test - Test PayOS credentials by creating and canceling a test payment
   */
  @Post('payos/credentials/test')
  async testPayOSCredentials(
    @Body()
    credentials: {
      clientId: string;
      apiKey: string;
      checksumKey: string;
    },
  ): Promise<{
    success: boolean;
    message: string;
    checkoutUrl?: string;
    paymentLinkId?: string;
    error?: string;
  }> {
    return this.paymentService.testPayOSCredentials(
      credentials.clientId,
      credentials.apiKey,
      credentials.checksumKey,
    );
  }

  // ========================================
  // 💳 PAYMENT LINK MANAGEMENT
  // ========================================

  /**
   * Create - Create a new payment link using PayOS
   */
  @Post('payos/link')
  async createPayOSPaymentLink(
    @Body() payload: { dto: CreatePaymentLinkDto; currentUser: TokenPayload },
  ) {
    return this.paymentService.createPayOSPaymentLink(
      payload.dto,
      payload.currentUser,
    );
  }

  /**
   * Cancel - Cancel a PayOS payment link
   */
  @Put('payos/link/:paymentId/cancel')
  async cancelPayOSPayment(
    @Param('paymentId') paymentId: string,
    @Body() payload: { reason: string },
  ) {
    await this.paymentService.cancelPayOSPayment(paymentId, payload.reason);
    return { message: 'PayOS payment cancelled successfully' };
  }

  /**
   * Create - Create a new cash payment record
   */
  @Post('cash')
  async createCashPayment(
    @Body() payload: { dto: CreateCashPaymentDto; currentUser: TokenPayload },
  ) {
    return this.paymentService.createCashPayment(
      payload.dto,
      payload.currentUser,
    );
  }

  /**
   * Update - Mark cash payment as paid
   */
  @Put('cash/:paymentId/paid')
  async markCashPaymentAsPaid(
    @Param('paymentId') paymentId: string,
    @Body() payload: { currentUser: TokenPayload },
  ) {
    return this.paymentService.markCashPaymentAsPaid(
      paymentId,
      payload.currentUser,
    );
  }

  /**
   * Update - Cancel cash payment and mark as failed
   */
  @Put('cash/:paymentId/cancel')
  async cancelCashPayment(
    @Param('paymentId') paymentId: string,
    @Body() payload: { reason: string; currentUser: TokenPayload },
  ) {
    return this.paymentService.cancelCashPayment(
      paymentId,
      payload.reason,
      payload.currentUser,
    );
  }

  // ========================================
  // 🔄 WEBHOOK PROCESSING
  // ========================================

  /**
   * Configure - Register webhook URL with PayOS for a clinic
   */
  @Post('payos/webhook/configure')
  async configurePayOSWebhook(
    @Body() payload: { clinicId: string; webhookUrl: string },
  ): Promise<{ message: string; result: string }> {
    const result = await this.paymentService.configurePayOSWebhook(
      payload.clinicId,
      payload.webhookUrl,
    );
    return {
      message: 'Webhook URL configured successfully with PayOS',
      result,
    };
  }

  /**
   * Process - Handle incoming webhooks from PayOS
   */
  @Post('payos/webhook')
  @HttpCode(HttpStatus.OK)
  async processPayOSWebhook(
    @Body() webhookData: WebhookType,
  ): Promise<{ message: string }> {
    await this.paymentService.processPayOSWebhook(webhookData);
    return { message: 'Webhook processed' };
  }

  // ========================================
  // 🏥 GENERAL PAYMENT MANAGEMENT
  // ========================================

  /**
   * Read - Get all payment configurations for a clinic (provider-agnostic)
   */
  @Get('clinic/:clinicId/configs')
  async getAllPaymentConfigs(
    @Param('clinicId') clinicId: string,
  ): Promise<unknown[]> {
    return this.paymentService.getAllPaymentConfigs(clinicId);
  }

  /**
   * Read - Get all payments for a clinic with filtering and pagination
   */
  @Get('clinic/:clinicId')
  async getPaymentsByClinic(
    @Param('clinicId') clinicId: string,
    @Query() dto: GetPaymentsDto,
  ) {
    return this.paymentService.getPaymentsByClinic(clinicId, dto);
  }

  /**
   * Read - Get payment by id
   */
  @Get('clinic/:clinicId/payment/:paymentId')
  async getPaymentById(
    @Param('clinicId') clinicId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentService.getPaymentById(clinicId, paymentId);
  }

  /**
   * Read - Get payment by appointment id for a specific clinic
   */
  @Get('clinic/:clinicId/appointment/:appointmentId')
  async getPaymentByAppointmentId(
    @Param('clinicId') clinicId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.paymentService.getPaymentByAppointmentId(
      clinicId,
      appointmentId,
    );
  }

  /**
   * Read - Get ALL payments for a specific clinic and appointment
   */
  @Get('clinic/:clinicId/appointment/:appointmentId/all')
  async getAllPaymentsByAppointmentId(
    @Param('clinicId') clinicId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    return this.paymentService.getAllPaymentsByAppointmentId(
      clinicId,
      appointmentId,
    );
  }

  /**
   * Read - Get all PAID payments for a specific clinic and appointment
   */
  @Get('clinic/:clinicId/appointment/:appointmentId/paid')
  async getPaidPaymentsByAppointmentId(
    @Param('clinicId') clinicId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    return await this.paymentService.getPaidPaymentsByAppointmentId(
      clinicId,
      appointmentId,
    );
  }

  /**
   * Read - Get all transactions for a clinic with filtering and pagination
   */
  @Get('clinic/:clinicId/transactions')
  async getTransactionsByClinic(
    @Param('clinicId') clinicId: string,
    @Query() dto: GetTransactionsDto,
  ) {
    return this.paymentService.getTransactionsByClinic(clinicId, dto);
  }

  /**
   * Read - Get payment statistics and analytics for a clinic
   */
  @Get('clinic/:clinicId/statistics')
  async getPaymentStatistics(
    @Param('clinicId') clinicId: string,
    @Query() dto: GetPaymentStatisticsDto,
  ) {
    return this.paymentService.getPaymentStatistics(clinicId, dto);
  }
}
