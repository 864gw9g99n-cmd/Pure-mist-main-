import Razorpay from 'razorpay';

export function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// Pure Mist supports two payment plans:
// - 'full': 100% of the cart is charged now via Razorpay.
// - 'advance_30': only 30% of the cart is charged now via Razorpay,
//    the remaining 70% is collected as Cash on Delivery and flagged
//    in the `orders` table as balance_due.
export function calculateChargeAmount(cartTotal: number, plan: 'full' | 'advance_30') {
  if (plan === 'advance_30') {
    const advance = Math.round(cartTotal * 0.3);
    return { amountToCharge: advance, balanceDue: cartTotal - advance };
  }
  return { amountToCharge: cartTotal, balanceDue: 0 };
}
