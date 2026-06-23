import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { stripe, TIER_PRICE_IDS } from "@/lib/stripe";

const VALID_TIERS = ["starter", "growth", "empire"] as const;

export async function GET(request: NextRequest) {
  const tier = request.nextUrl.searchParams.get("tier");

  if (!tier || !VALID_TIERS.includes(tier as (typeof VALID_TIERS)[number])) {
    return NextResponse.json({ error: "Invalid or missing tier" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const priceId = TIER_PRICE_IDS[tier as keyof typeof TIER_PRICE_IDS];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: authData.user.email!,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: authData.user.id, tier },
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/?checkout=cancelled`,
  });

  return NextResponse.redirect(session.url!, 303);
}
