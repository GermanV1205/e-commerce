import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { apiErrorMessage } from '../services/auth';
import { notifyCartUpdated } from '../context/CartCountContext';
import type { Cart, Order, SavedAddress, TransferInfo } from '../types';
import { variantPrice } from '../types';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalAmount: 0 });
  const [transfer, setTransfer] = useState<TransferInfo | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressId, setAddressId] = useState<string>('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    shippingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [cartRes, transferRes, addressRes] = await Promise.all([
          api.get<Cart>('/cart'),
          api.get<TransferInfo>('/orders/transfer-info'),
          api.get<SavedAddress[]>('/addresses'),
        ]);
        setCart(cartRes.data);
        setTransfer(transferRes.data);
        setAddresses(addressRes.data);
        const preferred = addressRes.data.find((item) => item.isDefault) ?? addressRes.data[0];
        if (preferred) setAddressId(preferred.id);
        if (cartRes.data.items.length === 0) {
          setError('Tu carrito está vacío.');
        }
      } catch (err) {
        setError(apiErrorMessage(err, 'No pudimos cargar el checkout.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onReceiptChange = (file: File | undefined) => {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setReceipt(null);
      setPreview(null);
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setError('El comprobante debe ser una imagen JPG, PNG o WEBP.');
      setReceipt(null);
      setPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El comprobante no puede superar 5 MB.');
      setReceipt(null);
      setPreview(null);
      return;
    }
    setError(null);
    setReceipt(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      setError('Sube la captura del comprobante de transferencia.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = new FormData();
    if (addressId) {
      payload.append('addressId', addressId);
    } else {
      payload.append('shippingAddress', form.shippingAddress);
      payload.append('city', form.city);
      payload.append('state', form.state);
      payload.append('zipCode', form.zipCode);
      payload.append('saveAddress', saveAddress ? 'true' : 'false');
    }
    if (form.notes.trim()) payload.append('notes', form.notes.trim());
    payload.append('receipt', receipt);

    try {
      const { data } = await api.post<Order>('/orders/checkout', payload);
      notifyCartUpdated();
      navigate(`/orders?placed=${data.id}`, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo completar el pedido.'));
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Preparando el checkout...</p>;

  const usingSaved = Boolean(addressId);

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-sm text-gray-500 mb-6">
          Transfiere el total y sube la captura del comprobante. El pedido queda marcado como pagado.
        </p>
        {error && <div role="alert" className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>}

        {transfer && (
          <div className="mb-4 bg-white border border-gray-200 rounded-lg p-5 text-sm">
            <p className="font-medium text-gray-900 mb-2">Transferencia bancaria</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-gray-600">
              <div><dt className="text-xs text-gray-400">Banco</dt><dd>{transfer.bankName}</dd></div>
              <div><dt className="text-xs text-gray-400">Tipo</dt><dd>{transfer.accountType}</dd></div>
              <div><dt className="text-xs text-gray-400">Cuenta</dt><dd className="font-mono">{transfer.accountNumber}</dd></div>
              <div><dt className="text-xs text-gray-400">Titular</dt><dd>{transfer.holder}</dd></div>
              {transfer.identification && (
                <div><dt className="text-xs text-gray-400">Identificación</dt><dd>{transfer.identification}</dd></div>
              )}
              <div><dt className="text-xs text-gray-400">Monto</dt><dd className="font-medium text-gray-900">${Number(cart.totalAmount).toFixed(2)} {transfer.currency}</dd></div>
            </dl>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {addresses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de envío</label>
              <select
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.street}, {address.city} {address.isDefault ? '(predeterminada)' : ''}
                  </option>
                ))}
                <option value="">Otra dirección…</option>
              </select>
            </div>
          )}

          {!usingSaved && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input required value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Calle y número" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Ciudad" />
                <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Provincia" />
                <input required value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Código postal" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Guardar esta dirección para el próximo pedido
              </label>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Comprobante de transferencia</label>
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => onReceiptChange(e.target.files?.[0])}
              className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-900 file:text-white"
            />
            {preview && (
              <img src={preview} alt="Vista previa del comprobante" className="mt-3 max-h-48 rounded-md border border-gray-200 object-contain" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notas (opcional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Ej. dejar en portería" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/cart" className="text-sm text-gray-600 hover:text-gray-900">← Volver al carrito</Link>
            <button type="submit" disabled={submitting || cart.items.length === 0 || !receipt} className="bg-black text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
              {submitting ? 'Confirmando...' : `Confirmar pedido $${Number(cart.totalAmount).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>

      <aside className="lg:col-span-2">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-medium text-gray-900 mb-4">Resumen</h2>
          <ul className="space-y-3 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-gray-600">
                  {item.productVariant.product.name} · {item.productVariant.size} × {item.quantity}
                </span>
                <span className="font-medium">${(variantPrice(item.productVariant) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <span className="text-sm text-gray-500">{cart.totalItems} artículo(s)</span>
            <span className="text-lg font-bold">${Number(cart.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
