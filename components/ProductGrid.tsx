'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import CheckoutDrawer from './CheckoutDrawer';

export default function ProductGrid({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleBuyNow(product: Product) {
    setSelected(product);
    setDrawerOpen(true);
  }

  return (
    <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-gold text-xs mb-3">The Collection</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-white">Signature Fragrances</h2>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-neutral-500 text-sm">
          The collection is being curated. Please check back shortly.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onBuyNow={handleBuyNow} />
          ))}
        </div>
      )}

      <CheckoutDrawer
        product={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </section>
  );
}
