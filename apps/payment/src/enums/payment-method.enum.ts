export enum PaymentMethod {
  // Bank transfers
  BANK_TRANSFER = 'BANK_TRANSFER',

  // Credit/Debit cards
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',

  // E-wallets
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY_WALLET = 'VNPAY_WALLET',
  PAYPAL = 'PAYPAL',

  // QR Code payments
  QR_CODE = 'QR_CODE',
  VIETQR = 'VIETQR',

  // Installment payments
  BUY_NOW_PAY_LATER = 'BUY_NOW_PAY_LATER',
  INSTALLMENT = 'INSTALLMENT',

  // Cash
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}
