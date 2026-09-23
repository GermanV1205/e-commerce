import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { apiErrorMessage } from '../services/auth';
import type { Cart } from '../types';
import { variantPrice } from '../types';

export const CartPage = () => {
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      const { data } = await api.get<Cart>('/cart');
      setCart(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'No pudimos cargar el carrito.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const { data } = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity });
      setCart(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo actualizar la cantidad.'));
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { data } = await api.delete<Cart>(`/cart/items/${itemId}`);
      setCart(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo quitar el artículo.'));
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando carrito...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tu carrito</h1>
      {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>}

      {cart.items.length === 0 ? (
        <p className="text-gray-500">
          El carrito está vacío. <Link to="/" className="underline">Ir al catálogo</Link>
        </p>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{item.productVariant.product.name}</p>
                <p className="text-sm text-gray-500">
                  {item.productVariant.size} · {item.productVariant.color} · ${variantPrice(item.productVariant).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
                <button type="button" onClick={() => removeItem(item.id)} className="text-sm text-red-600 hover:text-red-800">
                  Quitar
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">{cart.totalItems} artículo(s)</p>
            <p className="text-xl font-bold text-gray-900">${Number(cart.totalAmount).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
