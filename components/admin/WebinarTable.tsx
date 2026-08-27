'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WebinarRegistration } from '@/lib/types';
import { Trash2, Search, Download, Mail, Phone } from 'lucide-react';

function toCSVValue(value: string) {
  const str = value ?? '';
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(registrations: WebinarRegistration[]) {
  const headers = ['Name', 'Email', 'Phone', 'Registered'];
  const rows = registrations.map((r) => [
    r.name || '',
    r.email,
    r.phone || '',
    new Date(r.created_at).toLocaleString('en-IN'),
  ]);
  const csv = [headers, ...rows].map((row) => row.map(toCSVValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pure-mist-webinar-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function WebinarTable() {
  const supabase = createClient();
  const [registrations, setRegistrations] = useState<WebinarRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function loadRegistrations() {
    const { data } = await supabase
      .from('webinar_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    setRegistrations((data as WebinarRegistration[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadRegistrations();

    const channel = supabase
      .channel('webinar-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'webinar_registrations' },
        () => loadRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this registration permanently?')) return;
    await supabase.from('webinar_registrations').delete().eq('id', id);
    loadRegistrations();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
    );
  }, [registrations, search]);

  if (loading) {
    return <p className="text-neutral-500 text-sm">Loading registrations…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full rounded-lg bg-black/40 border border-gold/20 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
        </div>

        <button
          onClick={() => downloadCSV(filtered)}
          disabled={filtered.length === 0}
          className="btn-gold rounded-lg px-4 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <p className="text-xs text-neutral-500 px-1">
        Showing {filtered.length} of {registrations.length} registration
        {registrations.length !== 1 ? 's' : ''}
      </p>

      <div className="glass rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-left text-neutral-400 border-b border-white/10">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Contact</th>
              <th className="py-2 pr-4">Registered</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <Fragment key={r.id}>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4 text-white">{r.name || '—'}</td>
                  <td className="py-2 pr-4">
                    <p className="text-neutral-200 flex items-center gap-1.5 text-xs">
                      <Mail size={12} className="text-gold" /> {r.email}
                    </p>
                    {r.phone && (
                      <p className="text-neutral-400 flex items-center gap-1.5 text-xs mt-1">
                        <Phone size={12} className="text-gold" /> {r.phone}
                      </p>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-neutral-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-400 p-1"
                      aria-label="Delete registration"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-neutral-500">
                  {registrations.length === 0
                    ? 'No webinar registrations yet.'
                    : 'No registrations match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
