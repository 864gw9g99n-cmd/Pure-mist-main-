'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/lib/types';
import { ChevronDown, ChevronUp, Trash2, Search, Download } from 'lucide-react';

const paymentStatusColor: Record<string, string> = {
  fully_paid: 'bg-emerald text-white',
  '30pct_deposit_paid': 'bg-gold/20 text-gold',
  pending: 'bg-neutral-700 text-neutral-300',
  failed: 'bg-red-900/50 text-red-300',
};

const orderStatusColor: Record<OrderStatus, string> = {
  created: 'bg-neutral-700 text-neutral-300',
  paid: 'bg-gold/20 text-gold',
  shipped: 'bg-blue-900/50 text-blue-300',
  delivered: 'bg-emerald text-white',
  failed: 'bg-red-900/50 text-red-300',
  cancelled: 'bg-neutral-800 text-neutral-500',
};

const orderStatusOptions: OrderStatus[] = [
  'created',
  'paid',
  'shipped',
  'delivered',
  'failed',
  'cancelled',
];

const statusFilters = ['all', 'created', 'paid', 'shipped', 'delivered', 'failed', 'cancelled'] as const;

function toCSVValue(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(orders: Order[]) {
  const headers = [
    'Order ID',
    'Customer',
    'Email',
    'Phone',
    'Address',
    'City',
    'State',
    'Pincode',
    'Cart Total',
    'Amount Paid',
    'Balance Due',
    'Payment Plan',
    'Payment Status',
    'Order Status',
    'Placed',
  ];

  const rows = orders.map((o) => [
    o.id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.shipping_address,
    o.shipping_city,
    o.shipping_state,
    o.shipping_pincode,
    o.cart_total,
    o.amount_paid,
    o.balance_due,
    o.payment_plan,
    o.payment_status,
    o.order_status,
    new Date(o.created_at).toLocaleString('en-IN'),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(toCSVValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pure-mist-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function OrdersTable() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  async function handleDelete(id: string) {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return;
    await supabase.from('orders').delete().eq('id', id);
    loadOrders();
  }

  async function handleStatusChange(id: string, newStatus: OrderStatus) {
    setUpdatingId(id);
    await supabase.from('orders').update({ order_status: newStatus }).eq('id', id);
    setUpdatingId(null);
    loadOrders();
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return <p className="text-neutral-500 text-sm">Loading orders…</p>;
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
            placeholder="Search by name, email, phone, or order ID…"
            className="w-full rounded-lg bg-black/40 border border-gold/20 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg bg-black/40 border border-gold/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold capitalize"
        >
          {statusFilters.map((s) => (
            <option key={s} value={s} className="bg-midnight capitalize">
              {s === 'all' ? 'All Statuses' : s}
            </option>
          ))}
        </select>

        <button
          onClick={() => downloadCSV(filteredOrders)}
          disabled={filteredOrders.length === 0}
          className="btn-gold rounded-lg px-4 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <p className="text-xs text-neutral-500 px-1">
        Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
      </p>

      <div className="glass rounded-xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-neutral-400 border-b border-white/10">
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Order Value</th>
              <th className="py-2 pr-4">Paid</th>
              <th className="py-2 pr-4">Payment</th>
              <th className="py-2 pr-4">Order Status</th>
              <th className="py-2 pr-4">Placed</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <Fragment key={o.id}>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">
                    <p className="text-white">{o.customer_name}</p>
                    <p className="text-neutral-500 text-xs">{o.customer_email}</p>
                  </td>
                  <td className="py-2 pr-4 text-white whitespace-nowrap">
                    ₹{o.cart_total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 pr-4 text-gold whitespace-nowrap">
                    ₹{o.amount_paid.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        paymentStatusColor[o.payment_status] || 'bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {o.payment_status === 'fully_paid'
                        ? 'Fully Paid'
                        : o.payment_status === '30pct_deposit_paid'
                        ? '30% Deposit'
                        : o.payment_status === 'failed'
                        ? 'Failed'
                        : 'Pending'}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <select
                      value={o.order_status}
                      disabled={updatingId === o.id}
                      onChange={(e) =>
                        handleStatusChange(o.id, e.target.value as OrderStatus)
                      }
                      className={`text-xs px-2 py-1.5 rounded-full border-none capitalize cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50 ${orderStatusColor[o.order_status]}`}
                    >
                      {orderStatusOptions.map((s) => (
                        <option key={s} value={s} className="bg-midnight text-white capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-4 text-neutral-400 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="text-gold p-1"
                        aria-label="Toggle details"
                      >
                        {expanded === o.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="text-red-400 p-1"
                        aria-label="Delete order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="bg-black/20">
                    <td colSpan={7} className="p-4">
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
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-neutral-500">
                  {orders.length === 0 ? 'No orders yet.' : 'No orders match your search/filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
