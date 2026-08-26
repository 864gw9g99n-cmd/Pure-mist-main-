'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';

export default function ProductCard({
  product,
  onBuyNow,
}: {
  product: Product;
  onBuyNow: (product: Product) => void;
}) {
  const discountPct = Math.round(
    ((product.original_price - product.discounted_price) / product.original_price) * 100
  );

  return (
    <div className="group glass rounded-2xl overflow-hidden flex flex-col animate-fadeIn">
      <div className="relative w-full aspect-square bg-black/30">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
            No Image
          </div>
        )}
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 bg-gold text-black text-xs font-semibold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-serif text-lg text-white leading-snug">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-gold font-semibold text-lg">
            ₹{product.discounted_price.toLocaleString('en-IN')}
          </span>
          {product.original_price > product.discounted_price && (
            <span className="text-neutral-500 text-sm line-through">
              ₹{product.original_price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <button
          onClick={() => onBuyNow(product)}
          disabled={product.stock <= 0}
          className="btn-gold w-full mt-2 rounded-full py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
