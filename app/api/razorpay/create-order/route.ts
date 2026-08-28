import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getRazorpayInstance, calculateChargeAmount } from '@/lib/razorpay';
import { OrderItem, PaymentPlan } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      cartTotal: rawCartTotal,
      paymentPlan,
      customer,
      shipping,
      couponCode,
      formLoadedAt,
      website, // honeypot — real users never fill this
    }: {
      items: OrderItem[];
      cartTotal: number;
      paymentPlan: PaymentPlan;
      customer: { name: string; email: string; phone: string };
      shipping: { address: string; city: string; state: string; pincode: string };
      couponCode?: string;
      formLoadedAt?: number;
      website?: string;
    } = body;

    // --- Basic spam protection ---
    if (website) {
      // Honeypot field was filled — silently pretend success to not tip off bots.
      return NextResponse.json({ error: 'Could not process checkout.' }, { status: 400 });
    }
    if (formLoadedAt && Date.now() - formLoadedAt < 2000) {
      return NextResponse.json({ error: 'Please try again.' }, { status: 400 });
    }

    if (!items?.length || !rawCartTotal || !customer?.email || !shipping?.address) {
      return NextResponse.json({ error: 'Missing required checkout details.' }, { status: 400 });
    }
    if (paymentPlan !== 'full' && paymentPlan !== 'advance_30') {
      return NextResponse.json({ error: 'Invalid payment plan.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // --- Validate + apply coupon server-side (never trust client math) ---
    let cartTotal = rawCartTotal;
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('active', true)
        .single();

      if (coupon) {
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) >= new Date();
        const underLimit = coupon.max_uses === null || coupon.used_count < coupon.max_uses;
        if (notExpired && underLimit) {
          discountAmount =
            coupon.discount_type === 'percent'
              ? Math.round((rawCartTotal * coupon.discount_value) / 100)
              : Math.min(coupon.discount_value, rawCartTotal);
          cartTotal = Math.max(rawCartTotal - discountAmount, 0);
          appliedCouponCode = coupon.code;
        }
      }
    }

    const { amountToCharge, balanceDue } = calculateChargeAmount(cartTotal, paymentPlan);

    // 1. Create a pending order row in Supabase
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
        coupon_code: appliedCouponCode,
        discount_amount: discountAmount,
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
      discountAmount,
      cartTotal,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error creating order.' }, { status: 500 });
  }
}
