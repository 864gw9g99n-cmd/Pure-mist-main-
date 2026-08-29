'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, ProductVariant } from './types';

export type CartItem = {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: string, variantLabel: string | null) => void;
  updateQuantity: (productId: string, variantLabel: string | null, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'pure-mist-cart';

function cartKey(productId: string, variantLabel: string | null) {
  return `${productId}::${variantLabel || 'default'}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount (client-only, avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt/inaccessible storage — start with an empty cart, never crash the app.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated (avoids overwriting saved cart with
  // the initial empty state before load finishes)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full/unavailable — cart just won't persist this session.
    }
  }, [items, hydrated]);

  function addItem(product: Product, variant: ProductVariant | null, quantity = 1) {
    setItems((prev) => {
      const key = cartKey(product.id, variant?.label || null);
      const existing = prev.find(
        (i) => cartKey(i.product.id, i.variant?.label || null) === key
      );
      if (existing) {
        return prev.map((i) =>
          cartKey(i.product.id, i.variant?.label || null) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, variant, quantity }];
    });
  }

  function removeItem(productId: string, variantLabel: string | null) {
    const key = cartKey(productId, variantLabel);
    setItems((prev) => prev.filter((i) => cartKey(i.product.id, i.variant?.label || null) !== key));
  }

  function updateQuantity(productId: string, variantLabel: string | null, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId, variantLabel);
      return;
    }
    const key = cartKey(productId, variantLabel);
    setItems((prev) =>
      prev.map((i) =>
        cartKey(i.product.id, i.variant?.label || null) === key ? { ...i, quantity } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const price = i.variant ? i.variant.price : i.product.discounted_price;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
