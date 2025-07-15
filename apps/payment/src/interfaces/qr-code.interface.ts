export interface QRCodeData {
  paymentId: string;
  amount: number;
  currency: string;
  merchantId?: string;
  description?: string;
  expiryTime?: Date;
}

export interface QRCodeResponse {
  qrCodeUrl: string;
  qrCodeData: string;
  expiryTime: Date;
  isValid: boolean;
}

export interface QRCodeOptions {
  size?: number;
  format?: 'PNG' | 'SVG' | 'JPEG';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
