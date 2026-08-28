import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Enter a coupon code.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code.' }, { status: 404 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
    }

    const discountAmount =
      coupon.discount_type === 'percent'
        ? Math.round((cartTotal * coupon.discount_value) / 100)
        : Math.min(coupon.discount_value, cartTotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not validate coupon.' }, { status: 500 });
  }
}
