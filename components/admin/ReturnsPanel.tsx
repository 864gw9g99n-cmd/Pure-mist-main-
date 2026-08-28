'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ReturnRequest } from '@/lib/types';
import { Trash2, RefreshCw } from 'lucide-react';

const statusOptions: ReturnRequest['status'][] = ['pending', 'approved', 'rejected', 'completed'];

const statusColor: Record<ReturnRequest['status'], string> = {
  pending: 'bg-neutral-700 text-neutral-300',
  approved: 'bg-gold/20 text-gold',
  rejected: 'bg-red-900/50 text-red-300',
  completed: 'bg-emerald text-white',
};

export default function ReturnsPanel() {
  const supabase = createClient();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadRequests() {
    setLoading(true);
    const { data } = await supabase
      .from('return_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data as ReturnRequest[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel('returns-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'return_requests' }, () =>
        loadRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleStatusChange(id: string, status: ReturnRequest['status']) {
    setUpdatingId(id);
    await supabase.from('return_requests').update({ status }).eq('id', id);
    setUpdatingId(null);
    loadRequests();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this request permanently?')) return;
    await supabase.from('return_requests').delete().eq('id', id);
    loadRequests();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-gold-gradient">Return & Exchange Requests</h1>
        <button onClick={loadRequests} className="text-gold p-2" aria-label="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="glass rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-neutral-400 border-b border-white/10">
              <th className="py-2 pr-4">Order ID</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Reason</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Submitted</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="py-2 pr-4 text-white font-mono text-xs">{r.order_id.slice(0, 8)}</td>
                <td className="py-2 pr-4 text-neutral-300 text-xs">{r.customer_email}</td>
                <td className="py-2 pr-4 text-neutral-300 capitalize">{r.type}</td>
                <td className="py-2 pr-4 text-neutral-400 text-xs max-w-[200px] truncate" title={r.reason}>
                  {r.reason}
                </td>
                <td className="py-2 pr-4">
                  <select
                    value={r.status}
                    disabled={updatingId === r.id}
                    onChange={(e) =>
                      handleStatusChange(r.id, e.target.value as ReturnRequest['status'])
                    }
                    className={`text-xs px-2 py-1.5 rounded-full border-none capitalize cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50 ${statusColor[r.status]}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s} className="bg-midnight text-white capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-4 text-neutral-400 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString('en-IN')}
                </td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-white/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-neutral-500">
                  No return or exchange requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
