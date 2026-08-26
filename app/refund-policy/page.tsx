export const metadata = { title: 'Refund & Cancellation Policy | Pure Mist' };

export default function RefundPolicy() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      <h1 className="font-serif text-3xl sm:text-4xl text-gold-gradient mb-8">
        Refund &amp; Cancellation Policy
      </h1>
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-neutral-300 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">1. Order Cancellation</h2>
        <p>
          Orders may be cancelled free of charge before they are shipped. Once an order has
          been dispatched, it cannot be cancelled, and standard return terms below will
          apply. To request a cancellation, contact support@puremist.example with your Order
          ID as soon as possible.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">2. Returns</h2>
        <p>
          Due to the nature of our products (perfumes), we accept returns only for items
          that arrive damaged, defective, or incorrect. Requests must be raised within 48
          hours of delivery, accompanied by photos/video of the issue.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">3. Refunds — Prepaid (Pay in Full) Orders</h2>
        <p>
          Approved refunds for fully prepaid orders will be credited to the original payment
          method via Razorpay within 5–7 business days of approval.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">4. Refunds — 30% Advance / COD Orders</h2>
        <p>
          For orders paid via the 30% Advance option, the advance amount is refunded to the
          original payment method via Razorpay within 5–7 business days of an approved
          return. If the balance was already collected as Cash on Delivery, that amount will
          be refunded via bank transfer or UPI within the same window.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">5. Non-Returnable Items</h2>
        <p>
          For hygiene reasons, opened or used perfume bottles cannot be returned unless
          found to be defective.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">6. Contact</h2>
        <p>
          To initiate a return or refund, email support@puremist.example with your Order ID
          and details of the issue.
        </p>
      </div>
    </section>
  );
}
