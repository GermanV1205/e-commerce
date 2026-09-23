// src/pages/CatalogPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get<Product[]>('/products');
        setProducts(data);
      } catch (err) {
        console.error('Error cargando el catálogo:', err);
        setError('No pudimos cargar la colección en este momento.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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

      {products.length === 0 ? (
        <p className="text-gray-500">No hay productos disponibles en este momento.</p>
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
