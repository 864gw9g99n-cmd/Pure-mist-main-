export type ProductVariant = {
  label: string; // e.g. "50ml", "100ml"
  price: number; // absolute price for this variant (INR)
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  original_price: number; // in INR rupees
  discounted_price: number;
  stock: number;
  variants: ProductVariant[]; // empty array = no variants, use top-level price/stock
  is_active: boolean;
  created_at: string;
};

export type PaymentPlan = 'full' | 'advance_30';

export type OrderStatus = 'created' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'cancelled';

export type Order = {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  items: OrderItem[];
  cart_total: number; // full value of the order (after any coupon discount)
  amount_paid: number; // amount actually charged via Razorpay now
  balance_due: number; // remaining COD balance, 0 if pay-in-full
  coupon_code: string | null;
  discount_amount: number;
  payment_plan: PaymentPlan;
  payment_status: 'fully_paid' | '30pct_deposit_paid' | 'pending' | 'failed';
  order_status: OrderStatus;
  shiprocket_shipment_id: string | null;
  created_at: string;
};

export type OrderItem = {
  product_id: string;
  name: string; // includes variant label if applicable, e.g. "Velvet Oud - 100ml"
  variant_label: string | null;
  price: number;
  quantity: number;
};

export type WebinarRegistration = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type ReturnRequest = {
  id: string;
  order_id: string;
  customer_email: string;
  type: 'return' | 'exchange';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
};
