import { Order } from './types';

// Sends a plain order-confirmation email to YOU (the store owner) so you
// know the moment an order comes in. Requires RESEND_API_KEY and
// ADMIN_NOTIFICATION_EMAIL to be set — if either is missing, this is a
// no-op (it logs a warning instead of throwing, so checkout never fails
// because of a notification issue).
export async function notifyAdminOfNewOrder(order: Order) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Pure Mist Orders <orders@puremist.example>';

  if (!apiKey || !adminEmail) {
    console.warn(
      'Skipping admin order notification: RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not set.'
    );
    return;
  }

  const planLabel =
    order.payment_plan === 'advance_30' ? '30% Advance + COD Balance' : 'Paid in Full';

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${item.quantity}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">₹${item.price.toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#0d2b22;">New Pure Mist Order</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Payment Plan:</strong> ${planLabel}</p>
      <p><strong>Amount Paid Now:</strong> ₹${order.amount_paid.toLocaleString('en-IN')}</p>
      ${
        order.balance_due > 0
          ? `<p><strong>Balance Due on Delivery:</strong> ₹${order.balance_due.toLocaleString('en-IN')}</p>`
          : ''
      }
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
      <h3 style="margin-bottom:4px;">Customer</h3>
      <p style="margin:2px 0;">${order.customer_name}</p>
      <p style="margin:2px 0;">${order.customer_email}</p>
      <p style="margin:2px 0;">${order.customer_phone}</p>
      <h3 style="margin-bottom:4px;">Shipping Address</h3>
      <p style="margin:2px 0;">
        ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}
      </p>
      <h3 style="margin-bottom:4px;">Items</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #0d2b22;">Item</th>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #0d2b22;">Qty</th>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #0d2b22;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="margin-top:20px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders"
           style="background:#c9a227;color:#0a0f0d;padding:10px 18px;border-radius:24px;text-decoration:none;font-weight:600;">
          View in Admin Dashboard
        </a>
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `New Order — ₹${order.amount_paid.toLocaleString('en-IN')} from ${order.customer_name}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend admin notification failed:', errText);
    }
  } catch (err) {
    // Never let a notification failure break the checkout flow.
    console.error('Error sending admin order notification:', err);
  }
}

// Sends a confirmation email to a webinar registrant. Requires
// RESEND_API_KEY — if missing, this is a no-op (logs a warning, never
// throws, so registration always succeeds even if email fails).
export async function sendWebinarConfirmation(params: {
  name: string | null;
  email: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Pure Mist <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('Skipping webinar confirmation email: RESEND_API_KEY not set.');
    return;
  }

  const greetingName = params.name ? params.name : 'there';

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#0d2b22;">You're Registered — Pure Mist Webinar</h2>
      <p>Hi ${greetingName},</p>
      <p>
        Thank you for reserving your seat at the Pure Mist Perfume Webinar —
        an intimate masterclass on fragrance layering, rare ingredients, and
        the craft behind our collection.
      </p>
      <p>We'll email you the access details closer to the event date.</p>
      <p style="margin-top:24px;">Warmly,<br/>The Pure Mist Team</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.email,
        subject: 'Your Pure Mist Webinar Seat is Confirmed',
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend webinar confirmation failed:', errText);
    }
  } catch (err) {
    console.error('Error sending webinar confirmation email:', err);
  }
}

// Sends YOU a heads-up whenever someone registers for the webinar.
// Requires RESEND_API_KEY and ADMIN_NOTIFICATION_EMAIL — no-op otherwise.
export async function notifyAdminOfWebinarSignup(params: {
  name: string | null;
  email: string;
  phone: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Pure Mist <onboarding@resend.dev>';

  if (!apiKey || !adminEmail) {
    console.warn(
      'Skipping admin webinar notification: RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not set.'
    );
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#0d2b22;">New Webinar Registration</h2>
      <p><strong>Name:</strong> ${params.name || '—'}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><strong>Phone:</strong> ${params.phone || '—'}</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `New Webinar Signup — ${params.name || params.email}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend admin webinar notification failed:', errText);
    }
  } catch (err) {
    console.error('Error sending admin webinar notification:', err);
  }
}

// Sends the order confirmation to the CUSTOMER — separate from the admin
// alert above. Requires RESEND_API_KEY — no-op otherwise (never blocks
// checkout if email fails).
export async function sendCustomerOrderConfirmation(order: Order) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Pure Mist <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('Skipping customer order confirmation: RESEND_API_KEY not set.');
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${item.quantity}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">₹${item.price.toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('');

  const balanceHtml =
    order.balance_due > 0
      ? `<p style="color:#b76e79;"><strong>Balance Due on Delivery:</strong> ₹${order.balance_due.toLocaleString('en-IN')}</p>`
      : '';

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#0d2b22;">Thank You, ${order.customer_name}</h2>
      <p>Your Pure Mist order has been confirmed.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Amount Paid:</strong> ₹${order.amount_paid.toLocaleString('en-IN')}</p>
      ${balanceHtml}
      <h3 style="margin-bottom:4px;">Items</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #0d2b22;">Item</th>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #0d2b22;">Qty</th>
            <th style="text-align:left;padding:6px 12px;border-bottom:2px solid #0d2b22;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <h3 style="margin-bottom:4px;margin-top:20px;">Shipping To</h3>
      <p style="margin:2px 0;">
        ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}
      </p>
      <p style="margin-top:24px;color:#666;font-size:13px;">
        Questions about your order? Reply to this email or reach us at support@puremist.in.
      </p>
      <p style="margin-top:20px;">Warmly,<br/>The Pure Mist Team</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: order.customer_email,
        subject: `Order Confirmed — Pure Mist #${order.id.slice(0, 8)}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend customer confirmation failed:', errText);
    }
  } catch (err) {
    console.error('Error sending customer order confirmation:', err);
  }
}
