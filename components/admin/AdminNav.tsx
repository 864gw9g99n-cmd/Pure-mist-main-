'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Package, ShoppingBag, Mail, LogOut } from 'lucide-react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/webinar', label: 'Webinar', icon: Mail },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <>
      {/* Top bar (mobile) — just a label, no toggle needed since nav lives at bottom */}
      <div className="fixed top-0 left-0 right-0 h-14 z-40 glass border-b border-gold/10 flex items-center px-4 safe-top sm:hidden">
        <span className="font-serif text-lg text-gold-gradient">Pure Mist Admin</span>
      </div>

      {/* Sidebar (desktop only) */}
      <aside className="hidden sm:flex fixed top-0 left-0 h-full z-50 w-56 glass border-r border-gold/10 flex-col safe-top safe-bottom">
        <div className="px-5 py-5">
          <span className="font-serif text-lg text-gold-gradient">Pure Mist Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active ? 'bg-gold/10 text-gold' : 'text-neutral-300 hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {l.label}
              </Link>
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

      {/* Bottom tab bar (mobile only) — always visible, one tap to any section */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gold/10 safe-bottom sm:hidden">
        <div className="flex items-stretch">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] transition-colors ${
                  active ? 'text-gold' : 'text-neutral-400'
                }`}
              >
                <Icon size={20} />
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] text-neutral-400"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}
