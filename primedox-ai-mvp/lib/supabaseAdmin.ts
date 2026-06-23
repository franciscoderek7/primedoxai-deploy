import { createClient } from "@supabase/supabase-js";

// Service-role client. Server-only — never import this file from a Client Component.
// Bypasses RLS entirely, which is fine here since every table has RLS disabled anyway
// and this key never reaches the browser.
export function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
