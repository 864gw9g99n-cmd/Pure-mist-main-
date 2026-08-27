'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

// Admin routes render their own chrome (AdminNav sidebar, in
// app/admin/layout.tsx) — the storefront Header/Footer would otherwise
// overlap it (both are position: fixed), hiding the admin navigation
// underneath. This wrapper keeps the storefront chrome for customer-facing
// pages only.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="w-full overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
