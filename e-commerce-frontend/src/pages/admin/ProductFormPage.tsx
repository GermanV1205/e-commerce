import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { apiErrorMessage, apiErrorStatus } from '../../services/auth';
import type { Category, Product } from '../../types';

// Interfaz que hace match exacto con el modelo de Prisma
interface VariantInput {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

export const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Estado del producto principal
  const [product, setProduct] = useState({
    name: '',
    description: '',
    categoryId: '',
    slug: '',
  });

  // Las categorías las manda el backend: el categoryId debe ser un UUID que
  // exista de verdad o el INSERT viola la clave foránea.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get<Category[]>('/categories');
        setCategories(data);
        if (data.length > 0) {
          setProduct((prev) => ({ ...prev, categoryId: prev.categoryId || data[0].id }));
        }
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setFormError('No pudimos cargar las categorías. Ejecuta el seed de la base de datos.');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        const { data } = await api.get<Product>(`/products/${id}`);
        setProduct({
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          slug: data.slug,
        });
        if (data.variants?.length) {
          setVariants(
            data.variants.map((variant) => ({
              id: variant.id,
              size: variant.size,
              color: variant.color,
              sku: variant.sku,
              price: Number(variant.price),
              stock: variant.stock,
            })),
          );
        }
      } catch (err) {
        setFormError(apiErrorMessage(err, 'No pudimos cargar el producto.'));
      }
    };

    loadProduct();
  }, [id]);

  // Estado dinámico de las variantes
  const [variants, setVariants] = useState<VariantInput[]>([
    { id: '1', size: '', color: '', sku: '', price: 0, stock: 0 }
  ]);

  const handleAddVariant = () => {
    setVariants([...variants, { id: Date.now().toString(), size: '', color: '', sku: '', price: 0, stock: 0 }]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const [restockQty, setRestockQty] = useState<Record<string, number>>({});

  const handleRestock = async (variantId: string) => {
    const quantity = restockQty[variantId] ?? 0;
    if (quantity < 1) {
      setFormError('Indica cuántas unidades quieres agregar.');
      return;
    }
    setFormError(null);
    try {
      const { data } = await api.patch<{ id: string; stock: number }>(
        `/products/variants/${variantId}/restock`,
        { quantity },
      );
      setVariants((current) =>
        current.map((variant) => (variant.id === variantId ? { ...variant, stock: data.stock } : variant)),
      );
      setRestockQty((current) => ({ ...current, [variantId]: 0 }));
    } catch (err) {
      setFormError(apiErrorMessage(err, 'No se pudo reabastecer la variante.'));
    }
  };

  const handleVariantChange = (id: string, field: keyof VariantInput, value: string | number) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!product.categoryId) {
      setFormError('Selecciona una categoría antes de guardar.');
      return;
    }

    setLoading(true);

    try {
      const slug = product.slug || product.name.toLowerCase().trim().replace(/\s+/g, '-');

      if (isEdit && id) {
        await api.patch(`/products/${id}`, {
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          slug,
        });
      } else {
        await api.post('/products', {
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          slug,
          isActive: true,
          variants: variants.map((variant) => ({
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            stock: variant.stock,
          })),
        });
      }

      navigate('/admin/products');

    } catch (error) {
      console.error("Error al guardar el producto:", error);

      if (apiErrorStatus(error) === 403) {
        setFormError('Tu cuenta no tiene rol ADMIN para crear productos.');
      } else {
        setFormError(apiErrorMessage(error, 'Ocurrió un error al guardar el producto.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Prenda' : 'Registrar Nueva Prenda'}</h1>
          <p className="mt-1 text-sm text-gray-500">Añade los detalles, precio base y sus respectivas variantes (SKU).</p>
        </div>
        <button onClick={() => navigate('/admin/products')} className="text-gray-600 hover:text-gray-900 font-medium text-sm">
          &larr; Volver al inventario
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {formError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{formError}</div>
        )}

        {/* Sección: Información General */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Información General</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
              <input 
                type="text" 
                value={product.name}
                onChange={(e) => setProduct({...product, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-black focus:border-black sm:text-sm" 
                required 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea 
                rows={3} 
                value={product.description}
                onChange={(e) => setProduct({...product, description: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-black focus:border-black sm:text-sm" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                value={product.categoryId}
                onChange={(e) => setProduct({...product, categoryId: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-black focus:border-black sm:text-sm"
                required
              >
                <option value="" disabled>
                  {categories.length === 0 ? 'Sin categorías disponibles' : 'Selecciona una categoría'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug (URL amigable)</label>
              <input 
                type="text" 
                placeholder="ej: chaqueta-cuero-vintage"
                value={product.slug}
                onChange={(e) => setProduct({...product, slug: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-black focus:border-black sm:text-sm" 
              />
            </div>
          </div>
        </div>

        {!isEdit && <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Variantes de Inventario</h2>
            <button type="button" onClick={handleAddVariant} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              + Agregar Variante
            </button>
          </div>
          
          <div className="space-y-4 min-w-[700px]">
            {variants.map((variant) => (
              <div key={variant.id} className="flex items-center gap-3 p-4 border border-gray-100 rounded-md bg-gray-50">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
                  <input type="text" placeholder="Ej. CHQ-NG-S" value={variant.sku} onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-black" required />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Talla</label>
                  <input type="text" placeholder="S, M..." value={variant.size} onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-black" required />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                  <input type="text" placeholder="Negro" value={variant.color} onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-black" required />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input type="number" step="0.01" value={variant.price} onChange={(e) => handleVariantChange(variant.id, 'price', parseFloat(e.target.value) || 0)} className="block w-full border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-black" required />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" min="0" value={variant.stock} onChange={(e) => handleVariantChange(variant.id, 'stock', parseInt(e.target.value) || 0)} className="block w-full border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm focus:ring-black" required />
                </div>
                <div className="pt-5">
                  <button type="button" onClick={() => handleRemoveVariant(variant.id)} disabled={variants.length === 1} className={`p-1.5 rounded-md ${variants.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {isEdit && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Inventario (reabastecer)</h2>
            <div className="space-y-3">
              {variants.map((variant) => (
                <div key={variant.id} className="flex flex-wrap items-center gap-3 border border-gray-100 rounded-md p-3 bg-gray-50">
                  <p className="text-sm text-gray-800 flex-1">
                    {variant.sku} · {variant.size} · {variant.color}
                    <span className="ml-2 text-gray-500">Stock: {variant.stock}</span>
                  </p>
                  <input
                    type="number"
                    min={1}
                    value={restockQty[variant.id] || ''}
                    onChange={(e) =>
                      setRestockQty((current) => ({
                        ...current,
                        [variant.id]: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                    placeholder="Cant."
                  />
                  <button
                    type="button"
                    onClick={() => handleRestock(variant.id)}
                    className="text-sm bg-black text-white px-3 py-1.5 rounded-md"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/admin/products')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="bg-black py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50">
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};