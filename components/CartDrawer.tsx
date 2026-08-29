'use client';

import Image from 'next/image';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartDrawer({
  open,
  onClose,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 z-[60] transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] max-w-full z-[70] bg-midnight border-l border-gold/20 shadow-2xl transition-transform duration-300 flex flex-col safe-top safe-bottom ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gold/10">
          <h3 className="font-serif text-lg text-gold-gradient">
            Your Cart {items.length > 0 && `(${items.length})`}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-gold p-1">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-12">Your cart is empty.</p>
          ) : (
            items.map((item) => {
              const price = item.variant ? item.variant.price : item.product.discounted_price;
              const maxStock = item.variant ? item.variant.stock : item.product.stock;
              return (
                <div
                  key={`${item.product.id}-${item.variant?.label || 'default'}`}
                  className="glass rounded-xl p-3 flex gap-3"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/30 shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.product.name}
                      {item.variant ? ` - ${item.variant.label}` : ''}
                    </p>
                    <p className="text-gold text-xs mt-0.5">₹{price.toLocaleString('en-IN')}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.variant?.label || null,
                              item.quantity - 1
                            )
                          }
                          className="w-6 h-6 rounded-full glass text-gold text-xs flex items-center justify-center"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white text-xs w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.variant?.label || null,
                              Math.min(maxStock, item.quantity + 1)
                            )
                          }
                          className="w-6 h-6 rounded-full glass text-gold text-xs flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.variant?.label || null)}
                        className="text-red-400 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gold/10 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={onCheckout}
              className="btn-gold rounded-full py-3.5 font-medium text-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
