import { api } from './api';
import type { Cart, CartItem, ProductVariant } from '../types';

const KEY = 'guest-cart';

export type GuestLine = {
  productVariantId: string;
  quantity: number;
  size: string;
  color: string;
  price: number | string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    slug: string;
  };
};

const emptyCart = (): Cart => ({ items: [], totalItems: 0, totalAmount: 0 });

export const readGuestCart = (): GuestLine[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeGuestCart = (items: GuestLine[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const clearGuestCart = () => {
  localStorage.removeItem(KEY);
};

export const guestCartAsCart = (): Cart => {
  const items = readGuestCart().map((line): CartItem => ({
    id: line.productVariantId,
    quantity: line.quantity,
    productVariant: {
      id: line.productVariantId,
      productId: line.product.id,
      size: line.size,
      color: line.color,
      sku: '',
      price: line.price,
      stock: 99,
      imageUrl: null,
      product: line.product,
    },
  }));

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.productVariant.price) * item.quantity,
    0,
  );

  return { items, totalItems, totalAmount };
};

export const addGuestItem = (
  variant: ProductVariant,
  product: GuestLine['product'],
  quantity: number,
) => {
  const items = readGuestCart();
  const existing = items.find((line) => line.productVariantId === variant.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productVariantId: variant.id,
      quantity,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      product,
    });
  }
  writeGuestCart(items);
};

export const updateGuestQuantity = (productVariantId: string, quantity: number) => {
  writeGuestCart(
    readGuestCart().map((line) =>
      line.productVariantId === productVariantId ? { ...line, quantity } : line,
    ),
  );
};

export const removeGuestItem = (productVariantId: string) => {
  writeGuestCart(readGuestCart().filter((line) => line.productVariantId !== productVariantId));
};

export const mergeGuestCart = async () => {
  const items = readGuestCart();
  if (items.length === 0) return emptyCart();
  const { data } = await api.post<Cart>('/cart/merge', {
    items: items.map((line) => ({
      productVariantId: line.productVariantId,
      quantity: line.quantity,
    })),
  });
  clearGuestCart();
  return data;
};
