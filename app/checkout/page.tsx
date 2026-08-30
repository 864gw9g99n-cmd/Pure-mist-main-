'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Tag, LogIn } from 'lucide-react';
import { PaymentPlan } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type ShippingForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyForm: ShippingForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, hydrated } = useCart();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  const [plan, setPlan] = useState<PaymentPlan>('full');
  const [form, setForm] = useState<ShippingForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [formLoadedAt] = useState(() => Date.now());

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'checking' | 'applied' | 'error'>('idle');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(
    null
  );

  // Redirect to cart if it's empty — but only after we've confirmed the
  // cart actually loaded from storage, so we don't bounce someone away
  // during the brief moment before localStorage finishes reading.
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/cart');
    }
  }, [hydrated, items.length, router]);

  // Prefill name/email from the signed-in Google profile
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.user_metadata?.full_name || '',
        email: f.email || user.email || '',
      }));
    }
  }, [user]);

  const discount = appliedCoupon?.discountAmount || 0;
  const cartTotal = Math.max(subtotal - discount, 0);
  const advanceAmount = Math.round(cartTotal * 0.3);
  const balanceDue = cartTotal - advanceAmount;
  const amountToCharge = plan === 'full' ? cartTotal : advanceAmount;

  function update<K extends keyof ShippingForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponStatus('checking');
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon.');
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
      setCouponStatus('applied');
    } catch (err: any) {
      setCouponStatus('error');
      setCouponError(err.message);
    }
  }

  async function handlePay() {
    if (items.length === 0) return;
    setError('');
    for (const [, val] of Object.entries(form)) {
      if (!val.trim()) {
        setError('Please fill in all shipping details.');
        return;
      }
    }
    setLoading(true);

    try {
      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        name: i.variant ? `${i.product.name} - ${i.variant.label}` : i.product.name,
        variant_label: i.variant?.label || null,
        price: i.variant ? i.variant.price : i.product.discounted_price,
        quantity: i.quantity,
      }));

      const createRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          cartTotal: subtotal,
          paymentPlan: plan,
          couponCode: appliedCoupon?.code || undefined,
          customer: { name: form.name, email: form.email, phone: form.phone },
          shipping: {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          website,
          formLoadedAt,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Could not initiate payment.');

      const { razorpayOrderId, amount, currency, keyId, orderId } = createData;
      const itemsSummary = orderItems.map((i) => `${i.name} × ${i.quantity}`).join(', ');

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'Pure Mist',
        description:
          plan === 'full'
            ? itemsSummary
            : `${itemsSummary} — 30% Advance (Balance ₹${balanceDue.toLocaleString('en-IN')} on delivery)`,
        order_id: razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#c9a227' },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            clearCart();
            router.push(`/thank-you?order_id=${orderId}`);
          } else {
            setError(verifyData.error || 'Payment verification failed.');
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      });

      rzp.on('payment.failed', function () {
        setError('Payment failed. Please try again.');
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (!hydrated || items.length === 0) {
    return (
      <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16 max-w-2xl mx-auto">
        <p className="text-neutral-500 text-sm text-center py-16">Loading…</p>
      </section>
    );
  }

  if (authLoading) {
    return (
      <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16 max-w-2xl mx-auto">
        <p className="text-neutral-500 text-sm text-center py-16">Loading…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16 max-w-md mx-auto">
        <div className="glass rounded-2xl p-8 sm:p-10 text-center">
          <LogIn className="mx-auto text-gold mb-4" size={40} />
          <h1 className="font-serif text-2xl text-gold-gradient mb-3">Sign In to Continue</h1>
          <p className="text-neutral-400 text-sm mb-6">
            For order tracking and a smoother checkout, please sign in with Google before
            completing your purchase.
          </p>
          <button
            onClick={() => signInWithGoogle('/checkout')}
            className="btn-gold w-full rounded-full py-3.5 font-medium text-sm inline-flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
          <Link href="/cart" className="block mt-4 text-xs text-neutral-400 hover:text-gold">
            Back to Cart
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen-safe px-4 sm:px-6 pt-24 pb-16 max-w-2xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <h1 className="font-serif text-3xl text-gold-gradient mb-8">Checkout</h1>

      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-5">
        <div className="glass rounded-xl p-4 flex flex-col gap-2">
          {items.map((item) => {
            const price = item.variant ? item.variant.price : item.product.discounted_price;
            return (
              <div
                key={`${item.product.id}-${item.variant?.label || 'default'}`}
                className="flex justify-between text-sm"
              >
                <span className="text-neutral-300">
                  {item.product.name}
                  {item.variant ? ` - ${item.variant.label}` : ''} × {item.quantity}
                </span>
                <span className="text-white">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Coupon Code</p>
          {appliedCoupon ? (
            <div className="glass rounded-lg p-3 flex items-center justify-between">
              <span className="text-gold text-sm flex items-center gap-2">
                <Tag size={14} /> {appliedCoupon.code} applied
              </span>
              <button
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponStatus('idle');
                  setCouponInput('');
                }}
                className="text-neutral-400 text-xs hover:text-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 rounded-lg bg-black/40 border border-gold/20 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponStatus === 'checking'}
                className="glass rounded-lg px-4 py-2.5 text-sm text-gold whitespace-nowrap disabled:opacity-50"
              >
                {couponStatus === 'checking' ? '...' : 'Apply'}
              </button>
            </div>
          )}
          {couponStatus === 'error' && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Payment Option</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPlan('full')}
              className={`rounded-xl p-3 text-sm border transition-colors ${
                plan === 'full' ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-neutral-400'
              }`}
            >
              Pay in Full
            </button>
            <button
              onClick={() => setPlan('advance_30')}
              className={`rounded-xl p-3 text-sm border transition-colors ${
                plan === 'advance_30'
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/10 text-neutral-400'
              }`}
            >
              30% Advance + COD
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-neutral-400">Shipping Details</p>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <input
            placeholder="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
          <textarea
            placeholder="Address"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            rows={2}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
            />
          </div>
          <input
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => update('pincode', e.target.value)}
            className="rounded-lg bg-black/40 border border-gold/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold"
          />
        </div>

        <div className="glass rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between text-neutral-300">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-gold">
              <span>Discount</span>
              <span>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-medium">
            <span>Cart Total</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
          {plan === 'advance_30' && (
            <>
              <div className="flex justify-between text-gold">
                <span>Pay Now (30%)</span>
                <span>₹{advanceAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Balance Due on Delivery</span>
                <span>₹{balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className="btn-gold rounded-full py-3.5 font-medium text-sm disabled:opacity-60"
        >
          {loading ? 'Processing…' : `Pay ₹${amountToCharge.toLocaleString('en-IN')} Now`}
        </button>

        <Link href="/cart" className="text-center text-xs text-neutral-400 hover:text-gold">
          Back to Cart
        </Link>
      </div>
    </section>
  );
}
