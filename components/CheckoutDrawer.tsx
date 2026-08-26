'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { X } from 'lucide-react';
import { Product, PaymentPlan } from '@/lib/types';

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

export default function CheckoutDrawer({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [plan, setPlan] = useState<PaymentPlan>('full');
  const [form, setForm] = useState<ShippingForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQty(1);
      setPlan('full');
      setForm(emptyForm);
      setError('');
    }
  }, [open, product]);

  if (!product) return null;

  const cartTotal = product.discounted_price * qty;
  const advanceAmount = Math.round(cartTotal * 0.3);
  const balanceDue = cartTotal - advanceAmount;
  const amountToCharge = plan === 'full' ? cartTotal : advanceAmount;

  function update<K extends keyof ShippingForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePay() {
    setError('');
    for (const [key, val] of Object.entries(form)) {
      if (!val.trim()) {
        setError('Please fill in all shipping details.');
        return;
      }
    }
    setLoading(true);

    try {
      // 1. Create a pending order + Razorpay order on the server
      const createRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: product.id,
              name: product.name,
              price: product.discounted_price,
              quantity: qty,
            },
          ],
          cartTotal,
          paymentPlan: plan,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          shipping: {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Could not initiate payment.');

      const { razorpayOrderId, amount, currency, keyId, orderId } = createData;

      // 2. Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'Pure Mist',
        description:
          plan === 'full'
            ? `${product.name} × ${qty}`
            : `${product.name} × ${qty} — 30% Advance (Balance ₹${balanceDue.toLocaleString('en-IN')} on delivery)`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#c9a227' },
        handler: async function (response: any) {
          // 3. Verify payment signature server-side
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

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-[60] transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] max-w-full z-[70] bg-midnight border-l border-gold/20 shadow-2xl transition-transform duration-300 overflow-y-auto safe-top safe-bottom ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gold/10">
          <h3 className="font-serif text-lg text-gold-gradient">Checkout</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-gold p-1">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-5">
          <div className="glass rounded-xl p-4 flex gap-3 items-center">
            <div className="flex-1">
              <p className="text-white font-medium">{product.name}</p>
              <p className="text-gold text-sm">
                ₹{product.discounted_price.toLocaleString('en-IN')} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full glass text-gold"
              >
                −
              </button>
              <span className="w-6 text-center text-white">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-8 h-8 rounded-full glass text-gold"
              >
                +
              </button>
            </div>
          </div>

          {/* Payment plan selector */}
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
              Payment Option
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlan('full')}
                className={`rounded-xl p-3 text-sm border transition-colors ${
                  plan === 'full'
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-white/10 text-neutral-400'
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

          {/* Shipping form */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Shipping Details
            </p>
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

          {/* Summary */}
          <div className="glass rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between text-neutral-300">
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
            {loading
              ? 'Processing…'
              : `Pay ₹${amountToCharge.toLocaleString('en-IN')} Now`}
          </button>
        </div>
      </div>
    </>
  );
}
