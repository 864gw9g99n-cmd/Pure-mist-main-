'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Package, ShoppingBag, Mail, Tag, RotateCcw, LogOut } from 'lucide-react';
import OverviewPanel from './OverviewPanel';
import ProductsPanel from './ProductsPanel';
import OrdersTable from './OrdersTable';
import WebinarTable from './WebinarTable';
import CouponsPanel from './CouponsPanel';
import ReturnsPanel from './ReturnsPanel';

type Tab = 'dashboard' | 'products' | 'orders' | 'webinar' | 'coupons' | 'returns';

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'webinar', label: 'Webinar', icon: Mail },
  { key: 'coupons', label: 'Coupons', icon: Tag },
  { key: 'returns', label: 'Returns', icon: RotateCcw },
];

// Single-page admin: everything lives on one URL and switches via tab
// state, so there's never a "feature that only exists on a different
// page" gap.
export default function AdminHub() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen-safe bg-midnight">
      {/* Top bar (mobile) */}
      <div className="fixed top-0 left-0 right-0 h-14 z-40 glass border-b border-gold/10 flex items-center px-4 safe-top sm:hidden">
        <span className="font-serif text-lg text-gold-gradient">Pure Mist Admin</span>
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden sm:flex fixed top-0 left-0 h-full z-50 w-56 glass border-r border-gold/10 flex-col safe-top safe-bottom">
        <div className="px-5 py-5">
          <span className="font-serif text-lg text-gold-gradient">Pure Mist Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left ${
                  active ? 'bg-gold/10 text-gold' : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:bg-white/5 w-full"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Bottom tab bar (mobile) — icon-only to fit 6 sections + sign out */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gold/10 safe-bottom sm:hidden">
        <div className="flex items-stretch">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                title={t.label}
                className={`flex-1 flex items-center justify-center py-3 transition-colors ${
                  active ? 'text-gold' : 'text-neutral-400'
                }`}
              >
                <Icon size={19} />
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex-1 flex items-center justify-center py-3 text-neutral-400"
          >
            <LogOut size={19} />
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-14 sm:pt-0 pb-16 sm:pb-0 sm:pl-56 safe-bottom">
        <div className="p-4 sm:p-8">
          {tab === 'dashboard' && <OverviewPanel onNavigate={(t) => setTab(t)} />}
          {tab === 'products' && <ProductsPanel />}
          {tab === 'orders' && (
            <div className="flex flex-col gap-6">
              <h1 className="font-serif text-2xl text-gold-gradient">Orders</h1>
              <OrdersTable />
            </div>
          )}
          {tab === 'webinar' && (
            <div className="flex flex-col gap-6">
              <h1 className="font-serif text-2xl text-gold-gradient">Webinar Registrations</h1>
              <WebinarTable />
            </div>
          )}
          {tab === 'coupons' && <CouponsPanel />}
          {tab === 'returns' && <ReturnsPanel />}
        </div>
      </div>
    </div>
  );
}
