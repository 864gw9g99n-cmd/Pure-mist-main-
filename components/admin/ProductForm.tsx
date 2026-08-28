'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product, ProductVariant } from '@/lib/types';
import ImageUpload from './ImageUpload';
import { X, Plus, Trash2 } from 'lucide-react';

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
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
  const [useVariants, setUseVariants] = useState((product?.variants?.length || 0) > 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function addVariant() {
    setVariants([...variants, { label: '', price: 0, stock: 0 }]);
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: string) {
    const updated = [...variants];
    if (field === 'label') {
      updated[index] = { ...updated[index], label: value };
    } else {
      updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    }
    setVariants(updated);
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError('');
    if (!form.name || !form.original_price || !form.discounted_price) {
      setError('Name and prices are required.');
      return;
    }
    if (useVariants) {
      if (variants.length === 0) {
        setError('Add at least one variant, or turn off variants.');
        return;
      }
      for (const v of variants) {
        if (!v.label.trim() || v.price <= 0) {
          setError('Every variant needs a label and a price.');
          return;
        }
      }
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
      variants: useVariants ? variants : [],
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
                disabled={useVariants}
                className="w-full mt-1 rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold disabled:opacity-40"
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

          <div className="border-t border-white/10 pt-4">
            <label className="flex items-center gap-2 text-sm text-neutral-300 mb-3">
              <input
                type="checkbox"
                checked={useVariants}
                onChange={(e) => setUseVariants(e.target.checked)}
                className="accent-gold w-4 h-4"
              />
              This product has size/option variants
            </label>

            {useVariants && (
              <div className="flex flex-col gap-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      placeholder="e.g. 50ml"
                      value={v.label}
                      onChange={(e) => updateVariant(i, 'label', e.target.value)}
                      className="flex-1 rounded-lg bg-black/40 border border-gold/20 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={v.price || ''}
                      onChange={(e) => updateVariant(i, 'price', e.target.value)}
                      className="w-24 rounded-lg bg-black/40 border border-gold/20 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock || ''}
                      onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                      className="w-20 rounded-lg bg-black/40 border border-gold/20 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                    />
                    <button
                      onClick={() => removeVariant(i)}
                      className="text-red-400 p-2"
                      aria-label="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addVariant}
                  className="glass rounded-lg py-2 text-sm text-gold inline-flex items-center justify-center gap-2 mt-1"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>
            )}
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
