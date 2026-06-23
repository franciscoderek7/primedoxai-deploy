import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export const TIER_PRICE_IDS: Record<"starter" | "growth" | "empire", string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  growth: process.env.STRIPE_PRICE_GROWTH!,
  empire: process.env.STRIPE_PRICE_EMPIRE!,
};

export function tierFromPriceId(priceId: string | undefined): "starter" | "growth" | "empire" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  if (priceId === process.env.STRIPE_PRICE_EMPIRE) return "empire";
  return null;
}
