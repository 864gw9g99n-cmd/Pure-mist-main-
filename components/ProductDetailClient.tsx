'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import CheckoutDrawer from '@/components/CheckoutDrawer';

export default function ProductDetailClient({ product }: { product: Product }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const discountPct = Math.round(
    ((product.original_price - product.discounted_price) / product.original_price) * 100
  );

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/30 glass">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">
              No Image
            </div>
          )}
          {discountPct > 0 && (
            <span className="absolute top-4 left-4 bg-gold text-black text-xs font-semibold px-3 py-1.5 rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="uppercase tracking-[0.3em] text-gold text-xs mb-3">Signature Fragrance</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-gold font-semibold text-2xl">
              ₹{product.discounted_price.toLocaleString('en-IN')}
            </span>
            {product.original_price > product.discounted_price && (
              <span className="text-neutral-500 text-lg line-through">
                ₹{product.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-neutral-300 text-sm leading-relaxed">{product.description}</p>
          )}

          <p className="text-xs text-neutral-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Currently out of stock'}
          </p>

          <button
            onClick={() => setDrawerOpen(true)}
            disabled={product.stock <= 0}
            className="btn-gold w-full sm:w-auto rounded-full px-8 py-3.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
          </button>

          <div className="glass rounded-xl p-4 text-xs text-neutral-400 leading-relaxed">
            Pay in full, or choose 30% advance with the balance collected as COD on delivery.
            Free shipping across India.
          </div>
        </div>
      </div>

      <CheckoutDrawer product={product} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
