import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from('webinar_registrations').insert({
      name: name || null,
      email,
      phone: phone || null,
    });

    if (error) {
      console.error('Webinar insert error:', error.message);
      return NextResponse.json({ error: 'Could not save registration.' }, { status: 500 });
    }

    // --- Optional: send confirmation email via Resend ---
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'Pure Mist <webinar@puremist.example>',
    //     to: email,
    //     subject: 'Your Pure Mist Webinar Seat is Confirmed',
    //     html: `<p>Hi ${name || ''}, you're registered for the Pure Mist masterclass.</p>`,
    //   }),
    // });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
