import { createServiceClient } from '@/lib/supabase/server';
import Link from 'next/link';
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

export const dynamic = 'force-dynamic';

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();

  const [{ data: products }, { data: orders }, { count: webinarCount }] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('webinar_registrations').select('*', { count: 'exact', head: true }),
  ]);

  const allProducts = products || [];
  const allOrders = orders || [];

  const paidOrders = allOrders.filter((o) => o.order_status !== 'created' && o.order_status !== 'failed' && o.order_status !== 'cancelled');
  const totalRevenue = allOrders
    .filter((o) => o.order_status === 'paid' || o.order_status === 'shipped' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + (o.amount_paid || 0), 0);
  const pendingBalance = paidOrders.reduce((sum, o) => sum + (o.balance_due || 0), 0);
  const recentOrders = allOrders.slice(0, 5);

  const statusCounts = {
    paid: allOrders.filter((o) => o.order_status === 'paid').length,
    shipped: allOrders.filter((o) => o.order_status === 'shipped').length,
    delivered: allOrders.filter((o) => o.order_status === 'delivered').length,
  };

  const outOfStock = allProducts.filter((p) => p.is_active && p.stock === 0);
  const lowStock = allProducts.filter(
    (p) => p.is_active && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );

  const stats = [
    { label: 'Products', value: allProducts.length, icon: Package },
    { label: 'Orders', value: allOrders.length, icon: ShoppingBag },
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
    { label: 'Webinar Signups', value: webinarCount ?? 0, icon: Mail, color: 'text-gold' },
  ];

  const orderStatusBadge: Record<string, string> = {
    created: 'bg-neutral-700 text-neutral-300',
    paid: 'bg-gold/20 text-gold',
    shipped: 'bg-blue-900/50 text-blue-300',
    delivered: 'bg-emerald text-white',
    failed: 'bg-red-900/50 text-red-300',
    cancelled: 'bg-neutral-800 text-neutral-500',
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-2xl text-gold-gradient">Dashboard</h1>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products"
          className="btn-gold rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2"
        >
          <Package size={16} /> Add Product
        </Link>
        <Link
          href="/admin/orders"
          className="glass rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2 text-white hover:bg-white/5"
        >
          <ShoppingBag size={16} /> View Orders
        </Link>
        <Link
          href="/admin/webinar"
          className="glass rounded-full px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2 text-white hover:bg-white/5"
        >
          <Mail size={16} /> Webinar List
        </Link>
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
            <Link href="/admin/products" className="text-xs text-gold hover:underline">
              Manage Products →
            </Link>
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
          <Link href="/admin/orders" className="text-xs text-gold hover:underline">
            View All →
          </Link>
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
