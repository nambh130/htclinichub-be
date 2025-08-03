import { TokenPayload } from '@app/common';

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

export interface CredentialsStatus {
  exists: boolean;
  isActive: boolean;
  lastUpdated?: Date;
}

export interface DecryptedCredentials {
  [key: string]: string | boolean | Date;
  isActive: boolean;
  lastUpdated?: Date;
}

export interface PaymentData {
  id: string;
  clinicId: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: string;
  orderCode: string;
  providerPaymentId?: string;
  paymentUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProvider {
  // ========================================
  // 🔐 CREDENTIAL MANAGEMENT (CRUD)
  // ========================================

  /**
   * Create - Store encrypted credentials for a clinic
   */
  storeCredentials(
    clinicId: string,
    credentials: PaymentConfig,
    currentUser: TokenPayload,
  ): Promise<void>;

  /**
   * Read - Get the activation status of credentials for a clinic
   */
  getCredentialsStatus(clinicId: string): Promise<CredentialsStatus>;

  /**
   * Read - Get and decrypt credentials for a clinic
   */
  getCredentials(clinicId: string): Promise<DecryptedCredentials>;

  /**
   * Update - Update existing credentials
   */
  updateCredentials(
    clinicId: string,
    credentials: PaymentConfig,
    currentUser: TokenPayload,
  ): Promise<void>;

  /**
   * Update - Activate credentials for a clinic
   */
  activateCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<void>;

  /**
   * Update - Deactivate credentials for a clinic
   */
  deactivateCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<void>;

  /**
   * Delete - Permanently delete credentials for a clinic
   */
  deleteCredentials(clinicId: string): Promise<void>;

  // ========================================
  // 💳 PAYMENT LINK MANAGEMENT
  // ========================================

  /**
   * Create - Create payment link using the provider
   */
  createPaymentLink(
    request: CreatePaymentLinkRequest,
    currentUser: TokenPayload,
  ): Promise<CreatePaymentLinkResponse>;

  /**
   * Cancel payment (if supported by provider)
   */
  cancelPayment(paymentId: string, reason?: string): Promise<void>;

  // ========================================
  // 🔄 WEBHOOK MANAGEMENT
  // ========================================

  /**
   * Configure webhook URL for the provider
   */
  configureWebhook(clinicId: string, webhookUrl: string): Promise<string>;

  /**
   * Verify webhook signature for security
   */
  verifyWebhookSignature(clinicId: string, webhookData: any): Promise<any>;

  /**
   * Process webhook data from the provider with proper verification
   */
  processWebhook(webhookData: any): Promise<void>;

  // ========================================
  // 📊 PAYMENT DATA RETRIEVAL
  // ========================================

  /**
   * Get payment by ID with relations
   */
  getPaymentById(paymentId: string): Promise<PaymentData | null>;

  /**
   * Get payment by order code
   */
  getPaymentByOrderCode(orderCode: string): Promise<PaymentData | null>;

  /**
   * Get payments for a clinic with pagination
   */
  getPaymentsByClinic(
    clinicId: string,
    page?: number,
    limit?: number,
  ): Promise<{
    data: PaymentData[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Get provider-specific response from payment
   */
  // getProviderResponse(paymentId: string): Promise<any>;
}
