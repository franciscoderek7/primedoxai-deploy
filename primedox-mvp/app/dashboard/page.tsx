import { redirect } from "next/navigation";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import DashboardClient from "./dashboard-client";

const TIER_LIMITS: Record<string, number> = { free: 10, starter: 100, growth: 500, empire: 999999 };

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const admin = supabaseAdmin();
  const { data: userRow } = await admin
    .from("users")
    .select("id, email, tier, subscription_status, ai_requests_this_month, bonus_requests")
    .eq("id", authData.user!.id)
    .single();

  const { data: modes } = await admin.from("mode_rules").select("mode");

  if (!userRow) {
    redirect("/login");
  }

  const limit = (TIER_LIMITS[userRow.tier] ?? 10) + userRow.bonus_requests;

  return (
    <DashboardClient
      email={userRow.email}
      tier={userRow.tier}
      subscriptionStatus={userRow.subscription_status}
      current={userRow.ai_requests_this_month}
      limit={limit}
      modes={(modes ?? []).map((m) => m.mode)}
      referralLink={`${process.env.NEXT_PUBLIC_URL}/?ref=${userRow.id}`}
    />
  );
}
