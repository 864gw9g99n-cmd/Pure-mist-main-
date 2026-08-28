import { createServiceClient } from './supabase/server';

// Increments a coupon's used_count — called once, right after payment
// confirms (never at order creation, since that order might never
// actually be paid). No-ops if no coupon was used.
export async function incrementCouponUsage(couponCode: string | null) {
  if (!couponCode) return;
  const supabase = createServiceClient();
  const { error } = await supabase.rpc('increment_coupon_usage', { p_coupon_code: couponCode });
  if (error) {
    console.error(`Coupon usage increment failed for ${couponCode}:`, error.message);
  }
}
