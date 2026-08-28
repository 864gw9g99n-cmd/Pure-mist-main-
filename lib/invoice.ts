import { Order } from './types';

// Generates and downloads a simple GST-style tax invoice as a PDF, entirely
// client-side (no server PDF library needed). Prices are treated as
// GST-inclusive at 18% (standard rate for most cosmetics/fragrance HSN
// codes in India) and reverse-calculated into taxable value + CGST/SGST —
// this assumes an intra-state sale (CGST+SGST, not IGST). Update the
// business details below with your real registered details before relying
// on this for actual tax filing — this is a reasonable starting template,
// not a substitute for review by an accountant/CA for your specific GST
// registration and interstate sales.
const GST_RATE = 0.18;

const BUSINESS_NAME = 'Pure Mist';
const BUSINESS_ADDRESS = 'Your Registered Business Address, India';
const BUSINESS_GSTIN = process.env.NEXT_PUBLIC_BUSINESS_GSTIN || 'GSTIN NOT SET';

export async function downloadInvoice(order: Order) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  const taxableValue = order.cart_total / (1 + GST_RATE);
  const totalGst = order.cart_total - taxableValue;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  let y = 20;
  doc.setFontSize(18);
  doc.text(BUSINESS_NAME, 14, y);
  doc.setFontSize(9);
  doc.text('TAX INVOICE', 196, y, { align: 'right' });

  y += 6;
  doc.setFontSize(9);
  doc.text(BUSINESS_ADDRESS, 14, y);
  y += 5;
  doc.text(`GSTIN: ${BUSINESS_GSTIN}`, 14, y);

  y += 10;
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(`Invoice / Order ID: ${order.id}`, 14, y);
  y += 6;
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.text('Bill To:', 14, y);
  y += 5;
  doc.setFontSize(9);
  doc.text(order.customer_name, 14, y);
  y += 5;
  doc.text(order.customer_email, 14, y);
  y += 5;
  doc.text(order.customer_phone, 14, y);
  y += 5;
  const addressLines = doc.splitTextToSize(
    `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`,
    180
  );
  doc.text(addressLines, 14, y);
  y += addressLines.length * 5 + 8;

  // Items table header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 14, y);
  doc.text('Qty', 130, y);
  doc.text('Price', 155, y);
  doc.text('Amount', 180, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;
  doc.setFont('helvetica', 'normal');

  for (const item of order.items) {
    const lines = doc.splitTextToSize(item.name, 110);
    doc.text(lines, 14, y);
    doc.text(String(item.quantity), 130, y);
    doc.text(`Rs.${item.price.toLocaleString('en-IN')}`, 155, y);
    doc.text(`Rs.${(item.price * item.quantity).toLocaleString('en-IN')}`, 180, y);
    y += lines.length * 5 + 3;
  }

  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  doc.text('Taxable Value', 140, y);
  doc.text(`Rs.${taxableValue.toFixed(2)}`, 180, y);
  y += 6;
  doc.text('CGST @ 9%', 140, y);
  doc.text(`Rs.${cgst.toFixed(2)}`, 180, y);
  y += 6;
  doc.text('SGST @ 9%', 140, y);
  doc.text(`Rs.${sgst.toFixed(2)}`, 180, y);
  y += 6;

  if (order.discount_amount > 0) {
    doc.text(`Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`, 140, y);
    doc.text(`-Rs.${order.discount_amount.toFixed(2)}`, 180, y);
    y += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Total', 140, y);
  doc.text(`Rs.${order.cart_total.toLocaleString('en-IN')}`, 180, y);
  y += 6;
  doc.setFont('helvetica', 'normal');

  doc.text('Amount Paid', 140, y);
  doc.text(`Rs.${order.amount_paid.toLocaleString('en-IN')}`, 180, y);
  y += 6;

  if (order.balance_due > 0) {
    doc.text('Balance Due (COD)', 140, y);
    doc.text(`Rs.${order.balance_due.toLocaleString('en-IN')}`, 180, y);
    y += 6;
  }

  y += 14;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text('This is a computer-generated invoice.', 14, y);

  doc.save(`invoice-${order.id.slice(0, 8)}.pdf`);
}
