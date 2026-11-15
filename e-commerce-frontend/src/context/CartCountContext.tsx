import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import { getUser } from '../services/auth';
import { guestCartAsCart } from '../services/guest-cart';
import type { Cart } from '../types';

const CART_UPDATED = 'cart-updated';

export const notifyCartUpdated = () => {
  window.dispatchEvent(new Event(CART_UPDATED));
};

type CartCountValue = {
  totalItems: number;
  refreshCart: () => Promise<void>;
};

const CartCountContext = createContext<CartCountValue>({
  totalItems: 0,
  refreshCart: async () => undefined,
});

export const CartCountProvider = ({ children }: { children: ReactNode }) => {
  const [totalItems, setTotalItems] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!getUser()) {
      setTotalItems(guestCartAsCart().totalItems);
      return;
    }
    try {
      const { data } = await api.get<Cart>('/cart');
      setTotalItems(data.totalItems);
    } catch {
      setTotalItems(0);
    }
  }, []);

  useEffect(() => {
    const onCartUpdated = () => {
      void refreshCart();
    };
    void refreshCart();
    window.addEventListener(CART_UPDATED, onCartUpdated);
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'user' || event.key === 'guest-cart') void refreshCart();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CART_UPDATED, onCartUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshCart]);

  return (
    <CartCountContext.Provider value={{ totalItems, refreshCart }}>
      {children}
    </CartCountContext.Provider>
  );
};

export const useCartCount = () => useContext(CartCountContext);
