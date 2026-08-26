export const metadata = { title: 'Privacy Policy | Pure Mist' };

export default function PrivacyPolicy() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      <h1 className="font-serif text-3xl sm:text-4xl text-gold-gradient mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-neutral-300 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          Pure Mist (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) values your privacy. This
          Privacy Policy explains how we collect, use, and protect your personal information
          when you visit our website, register for our webinar, or purchase our products.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, including your name, email
          address, phone number, shipping address, and payment-related details processed
          securely through our payment partner, Razorpay. We do not store your card, UPI, or
          bank details on our own servers.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To process and fulfil your orders, including shipping and delivery</li>
          <li>To send order confirmations, updates, and webinar access details</li>
          <li>To respond to customer service requests</li>
          <li>To improve our products, website, and customer experience</li>
        </ul>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">3. Sharing of Information</h2>
        <p>
          We share information only with trusted third parties necessary to fulfil our
          services — including our payment processor (Razorpay), logistics and courier
          partners (such as Shiprocket), and communication providers used to send order and
          webinar notifications. We do not sell your personal data to any third party.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">4. Data Security</h2>
        <p>
          We implement reasonable technical and organisational measures to protect your
          personal information against unauthorised access, alteration, or disclosure.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">5. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data at any
          time by contacting us at support@puremist.example.
        </p>

        <h2 className="font-serif text-xl text-white mt-8 mb-3">6. Contact Us</h2>
        <p>
          For any questions regarding this Privacy Policy, please contact us at
          support@puremist.example.
        </p>
      </div>
    </section>
  );
}
