'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Package, ShoppingBag, Mail, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

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
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="fixed top-0 left-0 right-0 h-16 z-40 glass border-b border-gold/10 flex items-center justify-between px-4 safe-top sm:hidden">
        <span className="font-serif text-lg text-gold-gradient">Pure Mist Admin</span>
        <button onClick={() => setOpen(!open)} className="text-gold p-2">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar (desktop) / drawer (mobile) */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-56 glass border-r border-gold/10 flex flex-col safe-top safe-bottom transition-transform sm:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden sm:block px-5 py-5">
          <span className="font-serif text-lg text-gold-gradient">Pure Mist Admin</span>
        </div>
        <div className="sm:hidden h-16" />

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
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

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
