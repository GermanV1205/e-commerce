// Estos tipos reflejan exactamente lo que devuelve la API de NestJS.
// El precio vive en la variante, no en el producto.

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  /** Prisma serializa Decimal como string en JSON. Usa `variantPrice()` para leerlo. */
  price: number | string;
  stock: number;
  imageUrl: string | null;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  category: Category;
  variants: ProductVariant[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'CLIENT';
  firstName: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  productVariant: ProductVariant & {
    product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'slug'>;
  };
}

export interface Cart {
  id?: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface DashboardReport {
  metrics: {
    pendingOrders: number;
    completedOrders: number;
    criticalStockAlerts: number;
  };
  lowStockItems: {
    id: string;
    productName: string;
    stock: number;
  }[];
}

// --- Helpers de presentación ---------------------------------------------
// Prisma serializa Decimal como string en JSON, así que normalizamos aquí.

export const variantPrice = (variant: ProductVariant): number =>
  Number(variant.price);

export const productFromPrice = (product: Product): number =>
  product.variants.length === 0
    ? 0
    : Math.min(...product.variants.map(variantPrice));

export const productTotalStock = (product: Product): number =>
  product.variants.reduce((total, variant) => total + variant.stock, 0);
