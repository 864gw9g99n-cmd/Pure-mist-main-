import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const orderId = searchParams.order_id;
  let order = null;

  if (orderId) {
    const supabase = createServiceClient();
    const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
    order = data;
  }

  return (
    <section className="min-h-screen-safe flex items-center justify-center px-4 sm:px-6 pt-24 pb-16">
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-lg w-full text-center animate-fadeIn">
        <CheckCircle2 className="mx-auto text-gold mb-4" size={48} />
        <h1 className="font-serif text-2xl sm:text-3xl text-gold-gradient mb-2">
          Thank You{order?.customer_name ? `, ${order.customer_name}` : ''}
        </h1>
        <p className="text-neutral-400 text-sm mb-6">
          Your Pure Mist order has been confirmed.
        </p>

        {order && (
          <div className="text-left text-sm bg-black/30 rounded-xl p-4 space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-400">Order ID</span>
              <span className="text-white font-mono text-xs">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Amount Paid</span>
              <span className="text-gold">₹{order.amount_paid.toLocaleString('en-IN')}</span>
            </div>
            {order.balance_due > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-400">Balance Due on Delivery</span>
                <span className="text-white">₹{order.balance_due.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-400">Status</span>
              <span className="text-white capitalize">
                {order.payment_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}

        <Link href="/" className="btn-gold inline-block rounded-full px-6 py-3 text-sm font-medium">
          Continue Shopping
        </Link>

        {order && (
          <p className="mt-4 text-xs text-neutral-500">
            Need to return or exchange something?{' '}
            <Link
              href={`/return-request?order_id=${order.id}`}
              className="text-gold hover:underline"
            >
              Submit a request
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
