import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-black/40 safe-bottom mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl text-gold-gradient mb-3">PURE MIST</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            A house of fine fragrance, crafted for those who wear scent as signature.
          </p>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-gold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link href="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-gold">Terms of Service</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-gold">Refund & Cancellation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-gold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>support@puremist.example</li>
            <li>+91 00000 00000</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-neutral-600 pb-6">
        © {new Date().getFullYear()} Pure Mist. All rights reserved.
      </div>
    </footer>
  );
}
