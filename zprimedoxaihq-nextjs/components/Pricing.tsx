"use client";

import { useState } from "react";
import { Check, Crown, Zap, Building2, Loader2 } from "lucide-react";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Basic legal Q&A and document analysis",
    features: [
      "10 queries per month",
      "Basic document upload",
      "Email support",
      "Community access",
    ],
    popular: false,
    cta: "Start Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$199",
    period: "/month",
    description: "Unlimited access for serious practitioners",
    features: [
      "Unlimited queries",
      "Unlimited document upload",
      "Draft generation",
      "Case strategy analysis",
      "Priority support",
      "API access",
    ],
    popular: true,
    cta: "Start Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$999",
    period: "/month",
    description: "Custom AI trained for your organization",
    features: [
      "Everything in Pro",
      "Custom model configuration",
      "White-label option",
      "Dedicated support",
      "SLA guarantee",
      "On-premise deployment",
    ],
    popular: false,
    cta: "Start Enterprise",
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function checkout(product: string) {
    try {
      setLoading(product);
      setError("");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout unavailable");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("Checkout could not be started. Please try again.");
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your{" "}
            <span className="text-doc-gold">Power</span>
          </h2>

          <p className="text-doc-text/70 max-w-2xl mx-auto">
            Choose the PrimeDox AI plan that fits your operation.
            Secure checkout powered by Stripe.
          </p>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                tier.popular
                  ? "bg-doc-green/10 border-doc-gold shadow-lg shadow-doc-gold/20"
                  : "bg-doc-card border-doc-green/30 hover:border-doc-green/60"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-doc-gold text-doc-dark text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">
                  {tier.name}
                </h3>

                <p className="text-doc-text/60 text-sm mt-1">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-doc-gold">
                  {tier.price}
                </span>

                <span className="text-doc-text/60">
                  {tier.period}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-doc-text"
                  >
                    <Check className="w-5 h-5 text-doc-green shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => checkout(tier.id)}
                disabled={loading !== null}
                className={`block w-full py-3 rounded-lg font-bold text-center transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  tier.popular
                    ? "bg-doc-gold text-doc-dark hover:bg-doc-gold/90"
                    : "bg-doc-green/20 text-doc-green border border-doc-green hover:bg-doc-green/30"
                }`}
              >
                {loading === tier.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : tier.popular ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}

                {loading === tier.id ? "Opening Checkout..." : tier.cta}
              </button>
            </div>
          ))}
        </div>

        <PaymentMethods />
      </div>
    </section>
  );
}

function PaymentMethods() {
  return (
    <div className="mt-14 border-t border-doc-green/20 pt-8">
      <p className="text-center text-doc-text/50 text-xs uppercase tracking-widest mb-5">
        Secure payment options
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          "Visa",
          "Mastercard",
          "American Express",
          "Apple Pay",
          "Google Pay",
          "Stripe",
        ].map((method) => (
          <div
            key={method}
            className="px-4 py-2 rounded-md border border-doc-green/20 bg-doc-card text-doc-text/70 text-xs font-semibold"
          >
            {method}
          </div>
        ))}

        <div className="px-4 py-2 rounded-md border border-doc-gold/30 bg-doc-card text-doc-gold text-xs font-bold">
          PayPal
        </div>
      </div>

      <p className="text-center text-doc-text/40 text-xs mt-4">
        Payment methods shown may vary by location, device, currency, and
        payment-provider eligibility.
      </p>
    </div>
  );
}
