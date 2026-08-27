'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product, Order } from '@/lib/types';
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Mail,
} from 'lucide-react';

const LOW_STOCK_THRESHOLD = 5;

const orderStatusBadge: Record<string, string> = {
  created: 'bg-neutral-700 text-neutral-300',
  paid: 'bg-gold/20 text-gold',
  shipped: 'bg-blue-900/50 text-blue-300',
  delivered: 'bg-emerald text-white',
  failed: 'bg-red-900/50 text-red-300',
  cancelled: 'bg-neutral-800 text-neutral-500',
};

export default function OverviewPanel({
  onNavigate,
}: {
  onNavigate: (tab: 'products' | 'orders' | 'webinar') => void;
}) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [webinarCount, setWebinarCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [{ data: productsData }, { data: ordersData }, { count }] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('webinar_registrations').select('*', { count: 'exact', head: true }),
    ]);
    setProducts((productsData as Product[]) || []);
    setOrders((ordersData as Order[]) || []);
    setWebinarCount(count ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    const ordersChannel = supabase
      .channel('overview-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadAll())
      .subscribe();
    const productsChannel = supabase
      .channel('overview-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadAll())
      .subscribe();
    const webinarChannel = supabase
      .channel('overview-webinar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'webinar_registrations' }, () =>
        loadAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(webinarChannel);
    };
  }, []);

  if (loading) {
    return <p className="text-neutral-500 text-sm">Loading dashboard…</p>;
  }

  const paidOrders = orders.filter(
    (o) => o.order_status !== 'created' && o.order_status !== 'failed' && o.order_status !== 'cancelled'
  );
  const totalRevenue = orders
    .filter((o) => o.order_status === 'paid' || o.order_status === 'shipped' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + (o.amount_paid || 0), 0);
  const pendingBalance = paidOrders.reduce((sum, o) => sum + (o.balance_due || 0), 0);
  const recentOrders = orders.slice(0, 5);

  const statusCounts = {
    paid: orders.filter((o) => o.order_status === 'paid').length,
    shipped: orders.filter((o) => o.order_status === 'shipped').length,
    delivered: orders.filter((o) => o.order_status === 'delivered').length,
  };

  const outOfStock = products.filter((p) => p.is_active && p.stock === 0);
  const lowStock = products.filter(
    (p) => p.is_active && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );

  const stats = [
    { label: 'Products', value: products.length, icon: Package },
    { label: 'Orders', value: orders.length, icon: ShoppingBag },
    {
      label: 'Revenue Collected',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
    },
    {
      label: 'COD Balance Pending',
      value: `₹${pendingBalance.toLocaleString('en-IN')}`,
      icon: Clock,
    },
  ];

  const statusStats = [
    { label: 'Paid', value: statusCounts.paid, icon: IndianRupee, color: 'text-gold' },
    { label: 'Shipped', value: statusCounts.shipped, icon: Truck, color: 'text-blue-300' },
    { label: 'Delivered', value: statusCounts.delivered, icon: CheckCircle2, color: 'text-emerald' },
    { label: 'Webinar Signups', value: webinarCount, icon: Mail, color: 'text-gold' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-2xl text-gold-gradient">Dashboard</h1>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavigate('products')}
          className="btn-gold rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2"
        >
          <Package size={16} /> Add Product
        </button>
        <button
          onClick={() => onNavigate('orders')}
          className="glass rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2 text-white hover:bg-white/5"
        >
          <ShoppingBag size={16} /> View Orders
        </button>
        <button
          onClick={() => onNavigate('webinar')}
          className="glass rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2 text-white hover:bg-white/5"
        >
          <Mail size={16} /> Webinar List
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass rounded-xl p-4 flex flex-col gap-2">
              <Icon className="text-gold" size={20} />
              <span className="text-xl sm:text-2xl text-white font-semibold">{s.value}</span>
              <span className="text-xs text-neutral-400">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass rounded-xl p-4 flex flex-col gap-2">
              <Icon className={s.color} size={20} />
              <span className="text-xl sm:text-2xl text-white font-semibold">{s.value}</span>
              <span className="text-xs text-neutral-400">{s.label}</span>
            </div>
          );
        })}
      </div>

      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="glass rounded-xl p-4 border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
              <AlertTriangle size={16} />
              Stock Alerts
            </div>
            <button onClick={() => onNavigate('products')} className="text-xs text-gold hover:underline">
              Manage Products →
            </button>
          </div>
          {outOfStock.length > 0 && (
            <p className="text-xs text-red-400">
              Out of stock: {outOfStock.map((p) => p.name).join(', ')}
            </p>
          )}
          {lowStock.length > 0 && (
            <p className="text-xs text-amber-300">
              Running low: {lowStock.map((p) => `${p.name} (${p.stock})`).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-white">Recent Orders</h2>
          <button onClick={() => onNavigate('orders')} className="text-xs text-gold hover:underline">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-white/10">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Placed</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-white">{o.customer_name}</td>
                  <td className="py-2 pr-4 text-gold">₹{o.cart_total.toLocaleString('en-IN')}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize whitespace-nowrap ${
                        orderStatusBadge[o.order_status] || 'bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {o.order_status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-neutral-400">
                    {new Date(o.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-neutral-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
