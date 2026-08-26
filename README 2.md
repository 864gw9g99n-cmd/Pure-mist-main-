# Pure Mist — Luxury Perfume E-Commerce & Webinar Platform

Next.js 14 (App Router) + Tailwind CSS + Supabase + Razorpay, ready to deploy on Vercel.

## Stack
- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS
- **Auth/DB/Storage**: Supabase (Postgres, Auth, Storage)
- **Payments**: Razorpay (Pay in Full or 30% Advance + COD)
- **Hosting**: Vercel

## 1. Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Project Settings → API
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from Razorpay Dashboard → API Keys
- `RAZORPAY_WEBHOOK_SECRET` — set when you configure the webhook (step 4)

## 2. Database

In the Supabase SQL Editor, run `supabase/schema.sql`. This creates:
- `products`, `orders`, `webinar_registrations` tables with RLS policies
- The `product-images` public storage bucket
- Realtime enabled on `orders` (powers the live admin orders table)
- Two sample products (remove/edit before launch)

## 3. Create your admin login

Supabase Dashboard → Authentication → Users → **Add User** (email + password).
That account can log in at `/admin/login`. There's no public sign-up — this is
the only way to create admin accounts, by design.

## 4. Razorpay webhook (recommended)

Razorpay Dashboard → Settings → Webhooks → add endpoint:
`https://yourdomain.com/api/razorpay/webhook`, subscribe to `payment.captured`,
and copy the generated secret into `RAZORPAY_WEBHOOK_SECRET`. This is a backup
confirmation path in case a customer closes their browser mid-payment.

## 5. Order notifications (know when you get an order)

Create a free account at resend.com, verify a sending domain (or use their
test domain while developing), then set:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` — e.g. `Pure Mist Orders <orders@yourdomain.com>`
- `ADMIN_NOTIFICATION_EMAIL` — the inbox that should receive new-order alerts

Once set, you'll get an email with the customer, address, items, and amount
paid the instant a payment is confirmed — via both the `verify` route (normal
checkout) and the `webhook` route (backup, in case the customer closes their
browser mid-payment). If either variable is missing, this is skipped silently
and checkout still works normally.

## 6. Run locally

```bash
npm run dev
```

## 7. Deploy to Vercel

1. Push this repo to GitHub.
2. Import into Vercel.
3. Add all `.env.local` variables as Vercel Environment Variables.
4. Deploy. Update `NEXT_PUBLIC_SITE_URL` to your production URL.

## Drop-in integrations still to wire (optional)

Pre-wired with commented placeholders in `app/api/razorpay/verify/route.ts`
and `app/api/razorpay/webhook/route.ts`:
- Shiprocket shipment creation (passing the COD `balance_due`)
- A customer-facing confirmation email/WhatsApp (separate from the admin
  notification in step 5, which is already live)

## Project structure

```
app/                  Pages & API routes (App Router)
  admin/              Protected dashboard (products, orders)
  api/                Webinar capture + Razorpay create-order/verify/webhook
  privacy-policy/ …   Legal pages (Razorpay KYC requirement)
components/           UI components (+ components/admin/*)
lib/                  Supabase clients, Razorpay helper, shared types
supabase/schema.sql   Full DB schema, RLS, storage bucket, seed data
middleware.ts         Guards /admin routes via Supabase session
```
