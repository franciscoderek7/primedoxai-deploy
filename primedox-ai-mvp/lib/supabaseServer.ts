import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cookie-aware Supabase client using the anon key only — this is what reads/refreshes
// the logged-in user's *auth* session. The anon key is meant to be public by Supabase's
// own design (auth itself isn't gated by it); the service role key is the one that must
// never leave the server, and it lives only in lib/supabaseAdmin.ts.
//
// Works in both Server Components (cookie writes are no-ops there — middleware.ts is
// what actually refreshes the session cookie on each request) and Route Handlers
// (cookie writes succeed).
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
          // middleware.ts handles the actual refresh.
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
