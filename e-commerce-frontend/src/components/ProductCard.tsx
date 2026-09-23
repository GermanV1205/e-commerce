import type { Product } from '../types';
import { productFromPrice, productTotalStock } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const price = productFromPrice(product);
  const stock = productTotalStock(product);

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Imagen del producto */}
      <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 transition-opacity">
        <img
          src={product.imageUrl ?? ''}
          alt={product.name}
          className="w-full h-full object-center object-cover"
          onError={(e) => {
            // Si la imagen falla, inyectamos un placeholder neutro
            e.currentTarget.src = 'https://placehold.co/400x500/e2e8f0/475569?text=Sin+Imagen';
            e.currentTarget.onerror = null; // Previene bucles infinitos
          }}
        />
      </div>

      {/* Información de la prenda */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{product.category?.name ?? 'Sin categoría'}</p>

        {/* Fila de precio y botón */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            {product.variants.length > 1 && (
              <span className="text-xs font-normal text-gray-500 mr-1">desde</span>
            )}
            ${price.toFixed(2)}
          </p>
          <button
            disabled={stock === 0}
            className="bg-black text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {stock === 0 ? 'Agotado' : 'Ver Tallas'}
          </button>
        </div>
      </div>
    </div>
  );
};
