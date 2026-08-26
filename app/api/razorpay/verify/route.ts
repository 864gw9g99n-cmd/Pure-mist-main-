import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { notifyAdminOfNewOrder } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing verification fields.' }, { status: 400 });
    }

    // 1. Verify the HMAC signature Razorpay sent back
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await markOrderFailed(orderId);
      return NextResponse.json({ error: 'Payment signature mismatch.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const amountPaidNow =
      order.payment_plan === 'advance_30'
        ? Math.round(order.cart_total * 0.3)
        : order.cart_total;

    const paymentStatus =
      order.payment_plan === 'advance_30' ? '30pct_deposit_paid' : 'fully_paid';

    // 2. Mark order as paid
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id,
        amount_paid: amountPaidNow,
        payment_status: paymentStatus,
        order_status: 'paid',
      })
      .eq('id', orderId);

    if (updateErr) {
      console.error('Order update error:', updateErr.message);
      return NextResponse.json({ error: 'Could not finalize order.' }, { status: 500 });
    }

    // --- Placeholder: Shiprocket integration ---
    // Create a shipment in Shiprocket, passing the COD balance_due amount
    // (order.balance_due) as the "COD amount" the courier must collect.
    //
    // const token = await getShiprocketToken();
    // const shipment = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     order_id: order.id,
    //     order_date: new Date().toISOString(),
    //     billing_customer_name: order.customer_name,
    //     billing_address: order.shipping_address,
    //     billing_city: order.shipping_city,
    //     billing_state: order.shipping_state,
    //     billing_pincode: order.shipping_pincode,
    //     billing_phone: order.customer_phone,
    //     billing_email: order.customer_email,
    //     payment_method: order.payment_plan === 'advance_30' ? 'COD' : 'Prepaid',
    //     sub_total: order.cart_total,
    //     // COD amount to be collected by courier = order.balance_due
    //     order_items: order.items,
    //   }),
    // });
    // const shipmentData = await shipment.json();
    // await supabase.from('orders').update({ shiprocket_shipment_id: shipmentData.shipment_id }).eq('id', orderId);

    // --- Admin notification: email YOU the moment an order comes in ---
    await notifyAdminOfNewOrder({
      ...order,
      razorpay_payment_id,
      amount_paid: amountPaidNow,
      payment_status: paymentStatus,
      order_status: 'paid',
    });

    // --- Placeholder: customer-facing confirmation (Resend email / WhatsApp) ---
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     from: 'Pure Mist <orders@puremist.example>',
    //     to: order.customer_email,
    //     subject: `Order Confirmed — Pure Mist #${order.id}`,
    //     html: `<p>Thank you ${order.customer_name}! Your order is confirmed.</p>`,
    //   }),
    // });
    //
    // await fetch(process.env.WHATSAPP_WEBHOOK_URL!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: order.customer_phone,
    //     template: 'order_confirmation',
    //     params: [order.customer_name, order.id, String(order.cart_total)],
    //   }),
    // });

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error verifying payment.' }, { status: 500 });
  }
}

async function markOrderFailed(orderId: string) {
  const supabase = createServiceClient();
  await supabase
    .from('orders')
    .update({ payment_status: 'failed', order_status: 'failed' })
    .eq('id', orderId);
}
