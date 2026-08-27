'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/types';
import { X } from 'lucide-react';

export default function OrderEditModal({
  order,
  onClose,
  onSaved,
}: {
  order: Order;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    shipping_address: order.shipping_address,
    shipping_city: order.shipping_city,
    shipping_state: order.shipping_state,
    shipping_pincode: order.shipping_pincode,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setError('');
    for (const [, val] of Object.entries(form)) {
      if (!val.trim()) {
        setError('All fields are required.');
        return;
      }
    }
    setSaving(true);
    const { error: updateError } = await supabase.from('orders').update(form).eq('id', order.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-end sm:items-center justify-center">
      <div className="glass w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-gold-gradient">Edit Order</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-gold p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            placeholder="Customer Name"
            value={form.customer_name}
            onChange={(e) => update('customer_name', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.customer_email}
            onChange={(e) => update('customer_email', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <input
            placeholder="Phone"
            type="tel"
            value={form.customer_phone}
            onChange={(e) => update('customer_phone', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <textarea
            placeholder="Address"
            value={form.shipping_address}
            onChange={(e) => update('shipping_address', e.target.value)}
            rows={2}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={form.shipping_city}
              onChange={(e) => update('shipping_city', e.target.value)}
              className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
            />
            <input
              placeholder="State"
              value={form.shipping_state}
              onChange={(e) => update('shipping_state', e.target.value)}
              className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
            />
          </div>
          <input
            placeholder="Pincode"
            value={form.shipping_pincode}
            onChange={(e) => update('shipping_pincode', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold rounded-full py-3 text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
