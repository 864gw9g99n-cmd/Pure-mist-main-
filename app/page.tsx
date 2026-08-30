import { createPublicClient } from '@/lib/supabase/server';
import Hero from '@/components/Hero';
import IntroSpray from '@/components/IntroSpray';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/lib/types';

export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load products:', error.message);
    return [];
  }
  return data as Product[];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <IntroSpray />
      <Hero />

      <ProductGrid products={products} />

      <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="uppercase tracking-[0.3em] text-gold text-xs mb-3">Our Story</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-6">
          Crafted for the Discerning
        </h2>
        <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
          Pure Mist was founded on a single belief — that fragrance is memory, made
          wearable. Every bottle in our collection is composed with rare absolutes
          and precious oils, blended in small batches to preserve character and depth.
        </p>
      </section>
    </>
  );
}
