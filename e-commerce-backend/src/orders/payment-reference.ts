export const paymentReferenceFromOrderId = (orderId: string): string =>
  orderId.replace(/-/g, '').slice(0, 32);
