import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import {
  notifyAdminOfNewOrder,
  sendCustomerOrderConfirmation,
  notifyCustomerViaWhatsApp,
} from '@/lib/notifications';
import { decrementStockForOrder } from '@/lib/stock';
import { incrementCouponUsage } from '@/lib/coupons';

// Configure this URL in your Razorpay Dashboard → Settings → Webhooks.
// Acts as a reliable server-to-server backup to the client-side `verify`
// flow, in case the user closes the browser mid-payment.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');

  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const pureMistOrderId = payment.notes?.pure_mist_order_id;

    if (pureMistOrderId) {
      const supabase = createServiceClient();
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', pureMistOrderId)
        .single();

      // Only update if not already marked paid (avoid double-processing)
      if (order && order.order_status !== 'paid') {
        const amountPaidNow =
          order.payment_plan === 'advance_30'
            ? Math.round(order.cart_total * 0.3)
            : order.cart_total;
        const paymentStatus =
          order.payment_plan === 'advance_30' ? '30pct_deposit_paid' : 'fully_paid';

        await supabase
          .from('orders')
          .update({
            razorpay_payment_id: payment.id,
            amount_paid: amountPaidNow,
            payment_status: paymentStatus,
            order_status: 'paid',
          })
          .eq('id', pureMistOrderId);

        // This branch only runs if `verify` never completed (e.g. the
        // customer closed their browser mid-payment), so it's safe to
        // send notifications and decrement stock here too — the
        // `order_status !== 'paid'` guard above prevents double-processing
        // if `verify` already handled it.
        await decrementStockForOrder(order.items);
        await incrementCouponUsage(order.coupon_code);

        await notifyAdminOfNewOrder({
          ...order,
          razorpay_payment_id: payment.id,
          amount_paid: amountPaidNow,
          payment_status: paymentStatus,
          order_status: 'paid',
        });

        await sendCustomerOrderConfirmation({
          ...order,
          razorpay_payment_id: payment.id,
          amount_paid: amountPaidNow,
          payment_status: paymentStatus,
          order_status: 'paid',
        });

        await notifyCustomerViaWhatsApp({
          ...order,
          razorpay_payment_id: payment.id,
          amount_paid: amountPaidNow,
          payment_status: paymentStatus,
          order_status: 'paid',
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
