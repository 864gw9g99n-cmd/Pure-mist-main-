import { createServiceClient } from './supabase/server';
import { OrderItem } from './types';

// Decrements stock for every item in an order via the atomic
// `decrement_product_stock` Postgres function (never goes below 0,
// safe against two simultaneous buyers of the last unit). Called once,
// right after a payment is confirmed — never on order creation, since
// the order might never actually be paid.
export async function decrementStockForOrder(items: OrderItem[]) {
  const supabase = createServiceClient();

  for (const item of items) {
    const { error } = await supabase.rpc('decrement_product_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });
    if (error) {
      // Never block order finalization over a stock-sync issue — just log it.
      console.error(`Stock decrement failed for product ${item.product_id}:`, error.message);
    }
  }
}
