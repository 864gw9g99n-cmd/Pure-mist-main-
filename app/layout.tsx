import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import SiteChrome from '@/components/SiteChrome';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Pure Mist | Luxury Fragrance House',
    template: '%s | Pure Mist',
  },
  description:
    'Pure Mist — an exclusive collection of luxury perfumes. Join our masterclass webinar and discover scent as an art form.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Pure Mist | Luxury Fragrance House',
    description: 'An exclusive collection of luxury perfumes.',
    type: 'website',
    siteName: 'Pure Mist',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pure Mist | Luxury Fragrance House',
    description: 'An exclusive collection of luxury perfumes.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0f0d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen-safe bg-midnight w-full overflow-x-hidden">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
