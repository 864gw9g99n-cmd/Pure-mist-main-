import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendWebinarConfirmation, notifyAdminOfWebinarSignup } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, website, formLoadedAt } = await req.json();

    // --- Basic spam protection ---
    if (website) {
      // Honeypot field was filled — silently pretend success to not tip off bots.
      return NextResponse.json({ success: true });
    }
    if (formLoadedAt && Date.now() - formLoadedAt < 1500) {
      return NextResponse.json({ error: 'Please try again.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Throttle: if this email already registered in the last 60 seconds,
    // treat as a duplicate/spam retry rather than inserting again.
    const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recent } = await supabase
      .from('webinar_registrations')
      .select('id')
      .eq('email', email)
      .gte('created_at', sixtySecondsAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json({ success: true });
    }

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
