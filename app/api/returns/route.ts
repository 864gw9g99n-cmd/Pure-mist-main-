import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerEmail, type, reason } = await req.json();

    if (!orderId || !customerEmail || !type || !reason) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (type !== 'return' && type !== 'exchange') {
      return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Confirm the order actually exists and the email matches it,
    // so people can't file requests against orders that aren't theirs.
    const { data: order } = await supabase
      .from('orders')
      .select('id, customer_email')
      .eq('id', orderId)
      .single();

    if (!order || order.customer_email.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'We could not find an order matching that ID and email.' },
        { status: 404 }
      );
    }

    const { error } = await supabase.from('return_requests').insert({
      order_id: orderId,
      customer_email: customerEmail,
      type,
      reason,
    });

    if (error) {
      console.error('Return request insert error:', error.message);
      return NextResponse.json({ error: 'Could not submit request.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
