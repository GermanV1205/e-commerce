import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { apiErrorMessage } from '../services/auth';
import type { Order } from '../types';

export const MyOrdersPage = () => {
  const [params] = useSearchParams();
  const placedId = params.get('placed');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get<Order[]>('/orders/my-orders');
        setOrders(data);
      } catch (err) {
        setError(apiErrorMessage(err, 'No pudimos cargar tus pedidos.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Cargando pedidos...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

      {placedId && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-800">
          Pedido confirmado con tu comprobante de transferencia. El equipo de la tienda lo preparará en breve.
        </div>
      )}

      {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>}

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
          Todavía no tienes pedidos. <Link to="/" className="underline text-gray-900">Ir al catálogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Pedido {order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.productVariant.product.name} · {item.productVariant.size} × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-gray-500">
                Envío: {order.shippingAddress.street}, {order.shippingAddress.city}
              </p>
              {order.trackingNumber && (
                <p className="mt-1 text-sm text-gray-700">
                  Guía: <span className="font-mono">{order.trackingNumber}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {order.payment?.paymentMethodName ?? 'Transferencia bancaria'}
              </p>
              {order.payment?.receiptUrl && (
                <a href={order.payment.receiptUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block">
                  <img src={order.payment.receiptUrl} alt="Comprobante" className="h-20 rounded border border-gray-200 object-cover" />
                </a>
              )}
              <p className="mt-3 font-bold text-gray-900">${Number(order.totalAmount).toFixed(2)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
