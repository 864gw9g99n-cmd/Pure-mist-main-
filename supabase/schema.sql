-- ============================================================
-- PURE MIST — Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  original_price numeric(10,2) not null default 0,
  discounted_price numeric(10,2) not null default 0,
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Public (anon) can read only active products
create policy "Public can view active products"
  on products for select
  using (is_active = true);

-- Authenticated (admin) users can do everything
create policy "Admins can manage products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  razorpay_order_id text,
  razorpay_payment_id text,

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,

  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_pincode text not null,

  items jsonb not null default '[]',
  cart_total numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  balance_due numeric(10,2) not null default 0,

  payment_plan text not null default 'full' check (payment_plan in ('full', 'advance_30')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'fully_paid', '30pct_deposit_paid', 'failed')),
  order_status text not null default 'created'
    check (order_status in ('created', 'paid', 'failed', 'cancelled')),

  shiprocket_shipment_id text,

  created_at timestamptz not null default now()
);

alter table orders enable row level security;

-- No public access at all — orders are only ever written/read via
-- the service-role key from trusted server-side API routes, and
-- viewed by authenticated admins in the dashboard.
create policy "Admins can view all orders"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "Admins can update orders"
  on orders for update
  using (auth.role() = 'authenticated');

-- Inserts happen only via the service-role key (bypasses RLS),
-- so no insert policy is granted to anon/authenticated roles.

-- ============================================================
-- WEBINAR REGISTRATIONS
-- ============================================================
create table if not exists webinar_registrations (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

alter table webinar_registrations enable row level security;

create policy "Admins can view registrations"
  on webinar_registrations for select
  using (auth.role() = 'authenticated');

-- Inserts happen via the service-role key from /api/webinar

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_products_active on products (is_active);
create index if not exists idx_orders_status on orders (order_status);
create index if not exists idx_orders_created on orders (created_at desc);
create index if not exists idx_webinar_created on webinar_registrations (created_at desc);

-- ============================================================
-- STORAGE — product images bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read access to product images
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only authenticated admins can upload/delete
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- REALTIME — enable for the admin orders table (live updates)
-- ============================================================
alter publication supabase_realtime add table orders;

-- ============================================================
-- Sample product (optional — remove or edit before going live)
-- ============================================================
insert into products (name, slug, description, original_price, discounted_price, stock, is_active)
values
  ('Velvet Oud', 'velvet-oud', 'A rich, smoky oud layered with amber and rose.', 4999, 3499, 50, true),
  ('Emerald Bloom', 'emerald-bloom', 'Fresh green florals with a warm musk base.', 3999, 2799, 50, true)
on conflict (slug) do nothing;

-- ============================================================
-- IMPORTANT: Creating an admin user
-- ============================================================
-- Supabase Auth users cannot be created via SQL directly with a
-- password (passwords must go through Supabase Auth's hashing).
-- Create your admin user from: Supabase Dashboard → Authentication
-- → Users → "Add User" (set email + password there). That account
-- will then be able to log in at /admin/login.
