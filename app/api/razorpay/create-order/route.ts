import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getRazorpayInstance, calculateChargeAmount } from '@/lib/razorpay';
import { OrderItem, PaymentPlan } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      cartTotal,
      paymentPlan,
      customer,
      shipping,
    }: {
      items: OrderItem[];
      cartTotal: number;
      paymentPlan: PaymentPlan;
      customer: { name: string; email: string; phone: string };
      shipping: { address: string; city: string; state: string; pincode: string };
    } = body;

    if (!items?.length || !cartTotal || !customer?.email || !shipping?.address) {
      return NextResponse.json({ error: 'Missing required checkout details.' }, { status: 400 });
    }
    if (paymentPlan !== 'full' && paymentPlan !== 'advance_30') {
      return NextResponse.json({ error: 'Invalid payment plan.' }, { status: 400 });
    }

    const { amountToCharge, balanceDue } = calculateChargeAmount(cartTotal, paymentPlan);

    // 1. Create a pending order row in Supabase
    const supabase = createServiceClient();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_pincode: shipping.pincode,
        items,
        cart_total: cartTotal,
        amount_paid: 0,
        balance_due: balanceDue,
        payment_plan: paymentPlan,
        payment_status: 'pending',
        order_status: 'created',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order insert error:', orderError?.message);
      return NextResponse.json({ error: 'Could not create order.' }, { status: 500 });
    }

    // 2. Create the Razorpay order for the amount to charge NOW
    // (Razorpay amounts are in paise)
    const razorpay = getRazorpayInstance();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amountToCharge * 100),
      currency: 'INR',
      receipt: order.id,
      notes: {
        pure_mist_order_id: order.id,
        payment_plan: paymentPlan,
      },
    });

    // 3. Save the Razorpay order id against our order row
    await supabase
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', order.id);

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error creating order.' }, { status: 500 });
  }
}
