'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import ProductForm from '@/components/admin/ProductForm';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';

const LOW_STOCK_THRESHOLD = 5;

export default function ProductsPanel() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel('products-panel-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () =>
        loadProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this product permanently?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert(`Could not delete product: ${error.message}`);
      return;
    }
    loadProducts();
  }

  const lowStockProducts = products.filter(
    (p) => p.is_active && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );
  const outOfStockProducts = products.filter((p) => p.is_active && p.stock === 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-gold-gradient">Products</h1>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-gold rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="glass rounded-xl p-4 border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
            <AlertTriangle size={16} />
            Stock Alerts
          </div>
          {outOfStockProducts.length > 0 && (
            <p className="text-xs text-red-400">
              Out of stock: {outOfStockProducts.map((p) => p.name).join(', ')}
            </p>
          )}
          {lowStockProducts.length > 0 && (
            <p className="text-xs text-amber-300">
              Running low (≤{LOW_STOCK_THRESHOLD}):{' '}
              {lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="glass rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-neutral-400 border-b border-white/10">
              <th className="py-2 pr-4">Image</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Active</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-2 pr-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/30 relative">
                    {p.image_url && (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="py-2 pr-4 text-white">{p.name}</td>
                <td className="py-2 pr-4 text-gold">
                  ₹{p.discounted_price.toLocaleString('en-IN')}
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      p.stock === 0
                        ? 'text-red-400 font-medium'
                        : p.stock <= LOW_STOCK_THRESHOLD
                        ? 'text-amber-400 font-medium'
                        : 'text-neutral-300'
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.is_active ? 'bg-emerald text-white' : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setFormOpen(true);
                      }}
                      className="p-2 rounded-lg bg-white/5 text-gold hover:bg-white/10"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-white/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-500">
                  No products yet. Add your first fragrance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <ProductForm
          product={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
