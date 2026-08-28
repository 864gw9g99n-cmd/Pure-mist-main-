'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function ReturnRequestPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    orderId: searchParams.get('order_id') || '',
    customerEmail: '',
    type: 'return' as 'return' | 'exchange',
    reason: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit request.');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'success') {
    return (
      <section className="min-h-screen-safe flex items-center justify-center px-4 sm:px-6 pt-24 pb-16">
        <div className="glass rounded-2xl p-8 sm:p-10 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto text-gold mb-4" size={48} />
          <h1 className="font-serif text-2xl text-gold-gradient mb-2">Request Submitted</h1>
          <p className="text-neutral-400 text-sm">
            We&apos;ve received your {form.type} request and will get back to you within 2-3
            business days.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16">
      <div className="max-w-md mx-auto">
        <h1 className="font-serif text-3xl text-gold-gradient mb-2 text-center">
          Return or Exchange
        </h1>
        <p className="text-neutral-400 text-sm text-center mb-8">
          Submit a request and our team will reach out with next steps.
        </p>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
          <input
            required
            placeholder="Order ID"
            value={form.orderId}
            onChange={(e) => setForm({ ...form, orderId: e.target.value })}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <input
            required
            type="email"
            placeholder="Email used at checkout"
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'return' })}
              className={`rounded-xl p-3 text-sm border transition-colors ${
                form.type === 'return'
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/10 text-neutral-400'
              }`}
            >
              Return
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'exchange' })}
              className={`rounded-xl p-3 text-sm border transition-colors ${
                form.type === 'exchange'
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/10 text-neutral-400'
              }`}
            >
              Exchange
            </button>
          </div>
          <textarea
            required
            placeholder="Reason for your request"
            rows={4}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold resize-none"
          />

          {status === 'error' && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-gold rounded-full py-3 text-sm font-medium disabled:opacity-60"
          >
            {status === 'loading' ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>
    </section>
  );
}
