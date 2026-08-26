import { createServiceClient } from '@/lib/supabase/server';
import { Package, ShoppingBag, IndianRupee, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();

  const [{ count: productCount }, { data: orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
  ]);

  const allOrders = orders || [];
  const paidOrders = allOrders.filter((o) => o.order_status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount_paid || 0), 0);
  const pendingBalance = paidOrders.reduce((sum, o) => sum + (o.balance_due || 0), 0);
  const recentOrders = allOrders.slice(0, 5);

  const stats = [
    { label: 'Products', value: productCount ?? 0, icon: Package },
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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-2xl text-gold-gradient">Dashboard</h1>

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

      <div className="glass rounded-xl p-4 sm:p-6">
        <h2 className="font-serif text-lg text-white mb-4">Recent Orders</h2>
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
                  <td className="py-2 pr-4 text-neutral-300 capitalize">
                    {o.payment_status.replace(/_/g, ' ')}
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
