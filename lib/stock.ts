import { createServiceClient } from './supabase/server';
import { OrderItem } from './types';

// Decrements stock for every item in an order. Called once, right after
// a payment is confirmed — never on order creation, since the order
// might never actually be paid.
//
// Non-variant products use the atomic `decrement_product_stock` Postgres
// function (safe against two simultaneous buyers of the last unit).
//
// Variant products store stock inside a JSONB array, so that atomic SQL
// function can't reach into it — those are decremented with a
// read-then-write here instead. This has a small race-condition window
// (two simultaneous buyers of the very last variant unit could both
// succeed), acceptable for this store's volume; a dedicated Postgres
// function operating on jsonb would close that gap if needed later.
export async function decrementStockForOrder(items: OrderItem[]) {
  const supabase = createServiceClient();

  for (const item of items) {
    if (item.variant_label) {
      const { data: product } = await supabase
        .from('products')
        .select('variants')
        .eq('id', item.product_id)
        .single();

      if (product?.variants) {
        const updatedVariants = product.variants.map((v: { label: string; stock: number }) =>
          v.label === item.variant_label
            ? { ...v, stock: Math.max(v.stock - item.quantity, 0) }
            : v
        );
        const { error } = await supabase
          .from('products')
          .update({ variants: updatedVariants })
          .eq('id', item.product_id);
        if (error) {
          console.error(`Variant stock decrement failed for ${item.product_id}:`, error.message);
        }
      }
    } else {
      const { error } = await supabase.rpc('decrement_product_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
      if (error) {
        console.error(`Stock decrement failed for product ${item.product_id}:`, error.message);
      }
    }
  }
}
