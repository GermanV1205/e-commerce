const CART_UPDATED = 'cart-updated';

export const notifyCartUpdated = () => {
  window.dispatchEvent(new Event(CART_UPDATED));
};

export const CART_UPDATED_EVENT = CART_UPDATED;
