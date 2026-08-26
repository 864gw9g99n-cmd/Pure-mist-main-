'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/#collection', label: 'Collection' },
    { href: '/#webinar', label: 'Webinar' },
    { href: '/#about', label: 'Our Story' },
  ];

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
          <a
            href="/#collection"
            className="btn-gold px-5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2"
          >
            <ShoppingBag size={16} /> Shop Now
          </a>
        </nav>

        <button
          className="md:hidden text-gold p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
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
