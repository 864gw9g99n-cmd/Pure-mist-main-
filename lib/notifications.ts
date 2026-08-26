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
