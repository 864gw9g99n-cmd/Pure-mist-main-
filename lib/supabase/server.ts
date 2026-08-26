import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Use inside Server Components / Route Handlers / Server Actions.
// Respects the logged-in admin's session via cookies.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // called from a Server Component; middleware handles refresh
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // called from a Server Component; middleware handles refresh
          }
        },
      },
    }
  );
}

// Service-role client for privileged server-only operations
// (writing orders, bypassing RLS from trusted API routes only).
// NEVER import this in a Client Component.
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Anonymous, cookie-free client for public reads (e.g. the homepage
// product grid). Deliberately does NOT call cookies() from next/headers —
// using a dynamic API like cookies() on a statically/ISR-rendered page
// forces Next.js to treat the whole route as dynamic (and can throw
// during the build's static-generation pass). This client just talks to
// Supabase with the anon key and respects RLS like any public request.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
