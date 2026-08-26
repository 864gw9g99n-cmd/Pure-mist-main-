'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <section className="min-h-screen-safe flex items-center justify-center px-4 sm:px-6">
      <form
        onSubmit={handleLogin}
        className="glass rounded-2xl p-8 max-w-sm w-full flex flex-col gap-4"
      >
        <div className="text-center mb-2">
          <Lock className="mx-auto text-gold mb-3" size={32} />
          <h1 className="font-serif text-2xl text-gold-gradient">Pure Mist Admin</h1>
        </div>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
        />

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold rounded-full py-3 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </section>
  );
}
