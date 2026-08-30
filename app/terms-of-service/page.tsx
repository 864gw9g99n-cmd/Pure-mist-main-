export const metadata = { title: 'Terms of Service | Pure Mist' };

export default function TermsOfService() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      <h1 className="font-serif text-3xl sm:text-4xl text-gold-gradient mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-neutral-300 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the Pure Mist website
          and your purchase of products through it. By accessing our website or placing an
          order, you agree to be bound by these Terms.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">1. Products &amp; Pricing</h2>
        <p>
          All product descriptions, images, and prices are subject to change without notice.
          We reserve the right to limit quantities and to refuse or cancel any order at our
          discretion, including in cases of pricing errors or suspected fraud.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">2. Payments</h2>
        <p>
          Payments are processed securely via Razorpay. Depending on the option selected at
          checkout, you may pay the full order value upfront, or a 30% advance with the
          remaining 70% collected as Cash on Delivery at the time of shipment.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">3. Order Acceptance</h2>
        <p>
          Your receipt of an order confirmation does not signify our acceptance of your
          order. We reserve the right to accept or decline your order for any reason.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">4. Intellectual Property</h2>
        <p>
          All content on this website, including the Pure Mist name, logo, and product
          imagery, is the property of Pure Mist and may not be used without written consent.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">5. Limitation of Liability</h2>
        <p>
          Pure Mist shall not be liable for any indirect, incidental, or consequential
          damages arising from the use of our products or website.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">6. Governing Law</h2>
        <p>These Terms are governed by the laws of India.</p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">7. Contact</h2>
        <p>For questions about these Terms, contact us at supportpuremist@gmail.com.</p>
      </div>
    </section>
  );
}
