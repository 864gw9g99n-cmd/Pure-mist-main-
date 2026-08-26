import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendWebinarConfirmation, notifyAdminOfWebinarSignup } from '@/lib/notifications';

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

    // Send the registrant a confirmation email, and let you know a new
    // signup came in — both are best-effort and never block registration.
    await sendWebinarConfirmation({ name: name || null, email });
    await notifyAdminOfWebinarSignup({ name: name || null, email, phone: phone || null });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
