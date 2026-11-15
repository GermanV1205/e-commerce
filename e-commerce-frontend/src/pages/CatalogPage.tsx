import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get<Category[]>('/categories');
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    void loadCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Product[]>('/products', {
          params: categoryId ? { categoryId } : undefined,
        });
        setProducts(data);
      } catch (err) {
        console.error('Error cargando el catálogo:', err);
        setError('No pudimos cargar la colección en este momento.');
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [categoryId]);

  if (error) {
    return <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Catálogo de Ropa</h1>
          <p className="mt-2 text-sm text-gray-500">Descubre nuestra última colección y variantes disponibles.</p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryId('')}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              categoryId === '' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                categoryId === category.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
          No hay productos disponibles en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
