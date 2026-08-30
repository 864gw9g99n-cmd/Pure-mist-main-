'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag, User, LogOut } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, signInWithGoogle, signOut } = useAuth();

  const links = [
    { href: '/#collection', label: 'Collection' },
    { href: '/#about', label: 'Our Story' },
  ];

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top glass border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-serif text-2xl tracking-widest text-gold-gradient">
          PURE MIST
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide text-neutral-200 hover:text-gold transition-colors"
            >
              {l.label}
            </a>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm text-neutral-200 hover:text-gold"
              >
                <User size={16} className="text-gold" />
                {firstName}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 glass rounded-lg py-2 w-40">
                  <button
                    onClick={() => {
                      signOut();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:text-gold flex items-center gap-2"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle('/')}
              className="text-sm tracking-wide text-neutral-200 hover:text-gold transition-colors"
            >
              Sign In
            </button>
          )}

          <Link href="/cart" className="relative text-gold p-2" aria-label="View cart">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative text-gold p-2" aria-label="View cart">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          <button
            className="text-gold p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-gold/10 px-4 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-neutral-200 text-sm"
            >
              {l.label}
            </a>
          ))}

          {user ? (
            <>
              <span className="text-neutral-400 text-sm flex items-center gap-2">
                <User size={14} className="text-gold" /> {firstName}
              </span>
              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="text-neutral-400 text-sm flex items-center gap-2 text-left"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                signInWithGoogle('/');
                setOpen(false);
              }}
              className="text-neutral-200 text-sm text-left"
            >
              Sign In
            </button>
          )}

          <a
            href="/#collection"
            onClick={() => setOpen(false)}
            className="btn-gold px-5 py-2.5 rounded-full text-sm font-medium text-center"
          >
            Shop Now
          </a>
        </div>
      )}
    </header>
  );
}
