export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentType {
  APPOINTMENT_FEE = 'APPOINTMENT_FEE',
  LAB_ORDER_ITEM = 'LAB_ORDER_ITEM',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  BANKING = 'banking',
  CASH = 'cash',
}
