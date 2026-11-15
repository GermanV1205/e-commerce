import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../services/auth';
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from '../../types';

const NEXT_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trackingDraft, setTrackingDraft] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const { data } = await api.get<Order[]>('/orders');
      setOrders(data);
      setTrackingDraft(
        Object.fromEntries(data.map((order) => [order.id, order.trackingNumber ?? ''])),
      );
    } catch (err) {
      setError(apiErrorMessage(err, 'No pudimos cargar los pedidos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id: string, status: OrderStatus) => {
    try {
      const { data } = await api.patch<Order>(`/orders/${id}/status`, {
        status,
        trackingNumber: trackingDraft[id] ?? '',
      });
      setOrders((current) => current.map((order) => (order.id === id ? data : order)));
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo actualizar el estado.'));
    }
  };

  const saveTracking = async (id: string) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    try {
      const { data } = await api.patch<Order>(`/orders/${id}/status`, {
        status: order.status,
        trackingNumber: trackingDraft[id] ?? '',
      });
      setOrders((current) => current.map((item) => (item.id === id ? data : item)));
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar la guía.'));
    }
  };

  const processReturn = async (id: string) => {
    if (!window.confirm('¿Marcar esta orden como devuelta y restaurar stock?')) return;
    try {
      await api.patch(`/orders/${id}/return`);
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status: 'RETURNED' } : order)));
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo procesar la devolución.'));
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando pedidos...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos de la tienda</h1>
      {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>}

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
          Aún no hay pedidos.
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium text-gray-900">{order.user?.firstName} {order.user?.lastName}</p>
                    <p className="text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.items.map((item) => `${item.productVariant.product.name} × ${item.quantity}`).join(', ')}
                    <p className="text-xs text-gray-400 mt-1">{order.shippingAddress.city}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">${Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                    <p className="mt-1 text-xs text-gray-400">
                      {order.payment?.paymentMethodName ?? 'Transferencia'}
                    </p>
                    {order.payment?.receiptUrl && (
                      <a href={order.payment.receiptUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                        <img src={order.payment.receiptUrl} alt="Comprobante" className="h-12 w-12 object-cover rounded border border-gray-200" />
                      </a>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      <input
                        value={trackingDraft[order.id] ?? ''}
                        onChange={(e) => setTrackingDraft((current) => ({ ...current, [order.id]: e.target.value }))}
                        className="w-28 border border-gray-300 rounded px-1 py-0.5 text-xs"
                        placeholder="Nº guía"
                      />
                      <button type="button" onClick={() => saveTracking(order.id)} className="text-xs text-gray-700 hover:underline">
                        Guardar
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs border border-gray-300 rounded-md px-2 py-1"
                    >
                      {[...new Set([...NEXT_STATUSES, order.status])].map((status) => (
                        <option key={status} value={status}>{ORDER_STATUS_LABEL[status]}</option>
                      ))}
                    </select>
                    {order.status !== 'RETURNED' && order.status !== 'CANCELLED' && (
                      <button type="button" onClick={() => processReturn(order.id)} className="text-xs text-red-600 hover:text-red-800">
                        Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
