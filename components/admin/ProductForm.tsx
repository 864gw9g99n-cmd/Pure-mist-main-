'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import ImageUpload from './ImageUpload';
import { X } from 'lucide-react';

export default function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    image_url: product?.image_url || null,
    original_price: product?.original_price?.toString() || '',
    discounted_price: product?.discounted_price?.toString() || '',
    stock: product?.stock?.toString() || '10',
    is_active: product?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function handleSave() {
    setError('');
    if (!form.name || !form.original_price || !form.discounted_price) {
      setError('Name and prices are required.');
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      image_url: form.image_url,
      original_price: parseFloat(form.original_price),
      discounted_price: parseFloat(form.discounted_price),
      stock: parseInt(form.stock, 10) || 0,
      is_active: form.is_active,
    };

    const query = product
      ? supabase.from('products').update(payload).eq('id', product.id)
      : supabase.from('products').insert(payload);

    const { error } = await query;

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-end sm:items-center justify-center">
      <div className="glass w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-gold-gradient">
            {product ? 'Edit Product' : 'Add Product'}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-gold p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold resize-none"
          />

          <ImageUpload
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400">Original Price (₹)</label>
              <input
                type="number"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                className="w-full mt-1 rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Discounted Price (₹)</label>
              <input
                type="number"
                value={form.discounted_price}
                onChange={(e) => setForm({ ...form, discounted_price: e.target.value })}
                className="w-full mt-1 rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-xs text-neutral-400">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full mt-1 rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-300 pb-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-gold w-4 h-4"
              />
              Active (visible on store)
            </label>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold rounded-full py-3 text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
