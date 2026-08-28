import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createPublicClient } from '@/lib/supabase/server';
import { Product } from '@/lib/types';
import ProductDetailClient from '@/components/ProductDetailClient';

export const revalidate = 60;

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return (data as Product) || null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found | Pure Mist' };

  return {
    title: `${product.name} | Pure Mist`,
    description: product.description || `${product.name} — part of the Pure Mist signature collection.`,
    openGraph: {
      title: `${product.name} | Pure Mist`,
      description: product.description || undefined,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
