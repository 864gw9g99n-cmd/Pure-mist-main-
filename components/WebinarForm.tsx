'use client';

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function WebinarForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/webinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setForm({ name: '', email: '', phone: '' });
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'success') {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
        <CheckCircle2 className="mx-auto text-gold mb-3" size={40} />
        <h3 className="font-serif text-xl text-gold-gradient mb-2">You&apos;re Registered</h3>
        <p className="text-neutral-400 text-sm">
          Check your inbox — webinar access details are on their way.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 sm:p-8 max-w-md mx-auto flex flex-col gap-4"
    >
      <h3 className="font-serif text-xl sm:text-2xl text-gold-gradient text-center mb-2">
        Reserve Your Seat
      </h3>
      <input
        type="text"
        required
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
      />
      <input
        type="email"
        required
        placeholder="Email Address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
      />
      <input
        type="tel"
        placeholder="Phone (optional)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
      />

      {status === 'error' && <p className="text-red-400 text-xs text-center">{error}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-gold rounded-full py-3 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Mail size={16} />
        {status === 'loading' ? 'Registering…' : 'Save My Seat'}
      </button>
    </form>
  );
}
