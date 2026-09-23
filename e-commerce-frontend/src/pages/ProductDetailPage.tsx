import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { apiErrorMessage, getUser } from '../services/auth';
import type { Product, ProductVariant } from '../types';
import { variantPrice } from '../types';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selected, setSelected] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get<Product>(`/products/${id}`);
        setProduct(data);
        setSelected(data.variants[0] ?? null);
      } catch (err) {
        setError(apiErrorMessage(err, 'No pudimos cargar este producto.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selected) return;
    if (!getUser()) {
      navigate('/auth/login', { replace: true, state: { from: `/products/${id}` } });
      return;
    }

    setAdding(true);
    setError(null);
    try {
      await api.post('/cart', { productVariantId: selected.id, quantity });
      setNotice('Producto agregado al carrito.');
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo agregar al carrito.'));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando producto...</p>;
  if (error && !product) return <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>;
  if (!product) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-gray-100 rounded-lg overflow-hidden min-h-[360px]">
        <img
          src={product.imageUrl ?? ''}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x700/e2e8f0/475569?text=Sin+Imagen';
            e.currentTarget.onerror = null;
          }}
        />
      </div>

      <div>
        <p className="text-sm text-gray-500">{product.category?.name}</p>
        <h1 className="mt-1 text-3xl font-extrabold text-gray-900">{product.name}</h1>
        <p className="mt-4 text-gray-600">{product.description}</p>

        <p className="mt-6 text-3xl font-bold text-gray-900">
          ${selected ? variantPrice(selected).toFixed(2) : '0.00'}
        </p>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Variante</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => { setSelected(variant); setQuantity(1); }}
                className={`px-3 py-1.5 text-sm rounded border ${
                  selected?.id === variant.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                }`}
              >
                {variant.size} · {variant.color}
                {variant.stock === 0 ? ' (agotado)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <label className="text-sm text-gray-700">
            Cantidad
            <input
              type="number"
              min={1}
              max={selected?.stock ?? 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="ml-2 w-20 border border-gray-300 rounded-md px-2 py-1"
            />
          </label>
          <button
            type="button"
            disabled={!selected || selected.stock === 0 || adding}
            onClick={handleAddToCart}
            className="bg-black text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {adding ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        </div>

        {notice && <p className="mt-4 text-sm text-green-700">{notice} <Link className="underline" to="/cart">Ver carrito</Link></p>}
        {error && product && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
