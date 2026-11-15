import { ORDER_STATUS_LABEL, type OrderStatus } from '../types';

const TONE: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-700',
  REFUNDED: 'bg-gray-200 text-gray-700',
  RETURNED: 'bg-red-100 text-red-800',
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TONE[status]}`}>
    {ORDER_STATUS_LABEL[status]}
  </span>
);
