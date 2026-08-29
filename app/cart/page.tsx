'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal, hydrated } = useCart();

  if (!hydrated) {
    return (
      <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16 max-w-3xl mx-auto">
        <p className="text-neutral-500 text-sm text-center py-16">Loading your cart…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16 max-w-3xl mx-auto text-center">
        <ShoppingBag className="mx-auto text-neutral-600 mb-4" size={40} />
        <h1 className="font-serif text-2xl text-gold-gradient mb-2">Your Cart is Empty</h1>
        <p className="text-neutral-500 text-sm mb-6">
          Explore the collection and add something you love.
        </p>
        <Link href="/#collection" className="btn-gold inline-block rounded-full px-6 py-3 text-sm font-medium">
          Browse Collection
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl text-gold-gradient mb-8">
        Your Cart ({items.length})
      </h1>

      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => {
          const price = item.variant ? item.variant.price : item.product.discounted_price;
          const maxStock = item.variant ? item.variant.stock : item.product.stock;
          return (
            <div
              key={`${item.product.id}-${item.variant?.label || 'default'}`}
              className="glass rounded-xl p-4 flex gap-4"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black/30 shrink-0">
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
                <p className="text-white font-medium truncate">
                  {item.product.name}
                  {item.variant ? ` - ${item.variant.label}` : ''}
                </p>
                <p className="text-gold text-sm mt-0.5">₹{price.toLocaleString('en-IN')}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.variant?.label || null, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-full glass text-gold flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-white text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.variant?.label || null,
                          Math.min(maxStock, item.quantity + 1)
                        )
                      }
                      className="w-7 h-7 rounded-full glass text-gold flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.variant?.label || null)}
                    className="text-red-400 p-1.5"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Subtotal</span>
          <span className="text-white font-medium text-lg">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          className="btn-gold rounded-full py-3.5 font-medium text-sm"
        >
          Proceed to Checkout
        </button>
        <Link href="/#collection" className="text-center text-xs text-neutral-400 hover:text-gold">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
