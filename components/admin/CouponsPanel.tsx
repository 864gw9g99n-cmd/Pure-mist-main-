'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Coupon } from '@/lib/types';
import { Plus, Trash2, Tag, X } from 'lucide-react';

export default function CouponsPanel() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'flat',
    discount_value: '',
    max_uses: '',
    expires_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadCoupons() {
    setLoading(true);
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleToggleActive(coupon: Coupon) {
    await supabase.from('coupons').update({ active: !coupon.active }).eq('id', coupon.id);
    loadCoupons();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon permanently?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    loadCoupons();
  }

  async function handleCreate() {
    setError('');
    if (!form.code.trim() || !form.discount_value) {
      setError('Code and discount value are required.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('coupons').insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setFormOpen(false);
    setForm({ code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '' });
    loadCoupons();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-gold-gradient">Coupons</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="btn-gold rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="glass rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-neutral-400 border-b border-white/10">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Discount</th>
              <th className="py-2 pr-4">Uses</th>
              <th className="py-2 pr-4">Expires</th>
              <th className="py-2 pr-4">Active</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="py-2 pr-4 text-white flex items-center gap-1.5">
                  <Tag size={14} className="text-gold" /> {c.code}
                </td>
                <td className="py-2 pr-4 text-gold">
                  {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                </td>
                <td className="py-2 pr-4 text-neutral-300">
                  {c.used_count}
                  {c.max_uses ? ` / ${c.max_uses}` : ''}
                </td>
                <td className="py-2 pr-4 text-neutral-400 text-xs">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'No expiry'}
                </td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      c.active ? 'bg-emerald text-white' : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {c.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-white/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-500">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-end sm:items-center justify-center">
          <div className="glass w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto safe-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-gold-gradient">Add Coupon</h3>
              <button onClick={() => setFormOpen(false)} className="text-neutral-400 hover:text-gold p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                placeholder="Code (e.g. WELCOME10)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percent' | 'flat' })}
                  className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
                >
                  <option value="percent" className="bg-midnight">% Off</option>
                  <option value="flat" className="bg-midnight">₹ Flat Off</option>
                </select>
                <input
                  type="number"
                  placeholder={form.discount_type === 'percent' ? 'e.g. 10' : 'e.g. 500'}
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
                />
              </div>
              <input
                type="number"
                placeholder="Max uses (optional, blank = unlimited)"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
              />
              <div>
                <label className="text-xs text-neutral-400">Expiry date (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full mt-1 rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                onClick={handleCreate}
                disabled={saving}
                className="btn-gold rounded-full py-3 text-sm font-medium disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
