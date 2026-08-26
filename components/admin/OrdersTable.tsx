'use client';

import { Fragment, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

const statusColor: Record<string, string> = {
  fully_paid: 'bg-emerald text-white',
  '30pct_deposit_paid': 'bg-gold/20 text-gold',
  pending: 'bg-neutral-700 text-neutral-300',
  failed: 'bg-red-900/50 text-red-300',
};

export default function OrdersTable() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();

    // Real-time subscription: new orders and status changes appear instantly
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <p className="text-neutral-500 text-sm">Loading orders…</p>;
  }

  return (
    <div className="glass rounded-xl p-4 sm:p-6 overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="text-left text-neutral-400 border-b border-white/10">
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Order Value</th>
            <th className="py-2 pr-4">Paid</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Placed</th>
            <th className="py-2 pr-4" />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <Fragment key={o.id}>
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4">
                  <p className="text-white">{o.customer_name}</p>
                  <p className="text-neutral-500 text-xs">{o.customer_email}</p>
                </td>
                <td className="py-2 pr-4 text-white">₹{o.cart_total.toLocaleString('en-IN')}</td>
                <td className="py-2 pr-4 text-gold">₹{o.amount_paid.toLocaleString('en-IN')}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      statusColor[o.payment_status] || 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {o.payment_status === 'fully_paid'
                      ? 'Fully Paid'
                      : o.payment_status === '30pct_deposit_paid'
                      ? '30% Deposit Paid'
                      : o.payment_status === 'failed'
                      ? 'Failed'
                      : 'Pending'}
                  </span>
                </td>
                <td className="py-2 pr-4 text-neutral-400 whitespace-nowrap">
                  {new Date(o.created_at).toLocaleDateString('en-IN')}
                </td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    className="text-gold p-1"
                  >
                    {expanded === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </td>
              </tr>
              {expanded === o.id && (
                <tr className="bg-black/20">
                  <td colSpan={6} className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-neutral-400 mb-1">Shipping Address</p>
                        <p className="text-neutral-200">
                          {o.shipping_address}, {o.shipping_city}, {o.shipping_state} -{' '}
                          {o.shipping_pincode}
                        </p>
                        <p className="text-neutral-400 mt-2">Phone: {o.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 mb-1">Items</p>
                        {o.items?.map((item, i) => (
                          <p key={i} className="text-neutral-200">
                            {item.name} × {item.quantity} — ₹
                            {(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        ))}
                        {o.balance_due > 0 && (
                          <p className="text-gold mt-2">
                            Balance Due on Delivery: ₹{o.balance_due.toLocaleString('en-IN')}
                          </p>
                        )}
                        {o.razorpay_payment_id && (
                          <p className="text-neutral-500 mt-2 font-mono">
                            Payment ID: {o.razorpay_payment_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-neutral-500">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
