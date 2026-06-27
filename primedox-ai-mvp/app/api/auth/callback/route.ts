import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Supabase redirects here with ?code= after the user clicks the magic-link email.
// Exchanging the code sets the session cookie via supabaseServer()'s cookie adapter.
// Also captures a pending referral row on first arrival, if a `pdx_ref` cookie was set
// by ReferralCapture on the landing page.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = supabaseServer();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const referredUserId = data.user?.id;
    const referrerId = request.cookies.get("pdx_ref")?.value;

    if (referredUserId && referrerId && referrerId !== referredUserId) {
      const admin = supabaseAdmin();

      const { data: referrerExists } = await admin
        .from("users")
        .select("id")
        .eq("id", referrerId)
        .maybeSingle();

      const { data: existingReferral } = await admin
        .from("referrals")
        .select("id")
        .eq("referred_id", referredUserId)
        .maybeSingle();

      if (referrerExists && !existingReferral) {
        await admin.from("referrals").insert({
          referrer_id: referrerId,
          referred_id: referredUserId,
          status: "pending",
        });
      }
    }
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.delete("pdx_ref");
  return response;
}
