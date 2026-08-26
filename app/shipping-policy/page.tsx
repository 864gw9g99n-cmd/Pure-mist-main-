export const metadata = { title: 'Shipping Policy | Pure Mist' };

export default function ShippingPolicy() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      <h1 className="font-serif text-3xl sm:text-4xl text-gold-gradient mb-8">Shipping Policy</h1>
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-neutral-300 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">1. Processing Time</h2>
        <p>
          Orders are processed within 1–2 business days of payment confirmation (or, for 30%
          advance orders, within 1–2 business days of order placement).
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">2. Shipping Partners</h2>
        <p>
          We ship pan-India through trusted courier partners integrated via Shiprocket.
          Estimated delivery time is 3–7 business days depending on your location.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">3. Cash on Delivery (Balance Due)</h2>
        <p>
          For orders placed with the &quot;30% Advance&quot; option, the remaining 70% of the
          order value is collected by our courier partner as Cash on Delivery at the time of
          delivery. Please keep the exact balance amount ready to ensure a smooth handover.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">4. Shipping Charges</h2>
        <p>
          Shipping charges, if applicable, will be clearly displayed at checkout prior to
          payment.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">5. Tracking</h2>
        <p>
          Once your order ships, you will receive a tracking link via email and/or WhatsApp.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">6. Delays</h2>
        <p>
          While we strive to meet estimated delivery windows, delays may occur due to
          courier logistics, weather, or regional restrictions beyond our control.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">7. Contact</h2>
        <p>For shipping queries, contact us at support@puremist.example.</p>
      </div>
    </section>
  );
}
