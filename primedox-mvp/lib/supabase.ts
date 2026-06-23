import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Service-role client. Server-only — never import this from a Client Component.
// Bypasses RLS, which is fine since every table has RLS disabled and this key
// never reaches the browser.
export function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Cookie-aware client using only the anon key — reads/refreshes the logged-in user's
// auth session. Works in Server Components (cookie writes are no-ops there;
// middleware.ts does the actual refresh) and in Route Handlers (writes succeed).
export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component — cookies are read-only there.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Same as above.
        }
      },
    },
  });
}
