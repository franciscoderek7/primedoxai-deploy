"use client";

import { Check, Crown, Zap, Building2 } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Basic legal Q&A and document analysis",
    features: ["10 queries per month", "Basic document upload", "Email support", "Community access"],
    popular: false,
    cta: "Pre-Order Starter",
    stripeLink: "PASTE_STRIPE_LINK_HERE_STARTER",
  },
  {
    name: "Pro",
    price: "$199",
    period: "/month",
    description: "Unlimited access for serious practitioners",
    features: [
      "Unlimited queries",
      "Unlimited document upload",
      "Draft generation (motions, affidavits)",
      "Case strategy analysis",
      "Priority support",
      "API access",
    ],
    popular: true,
    cta: "Pre-Order Pro",
    stripeLink: "PASTE_STRIPE_LINK_HERE_PRO",
  },
  {
    name: "Enterprise",
    price: "$999",
    period: "/month",
    description: "Custom AI trained on your firm's data",
    features: [
      "Everything in Pro",
      "Custom model fine-tuning",
      "White-label option",
      "Dedicated support",
      "SLA guarantee",
      "On-premise deployment",
    ],
    popular: false,
    cta: "Contact Sales",
    stripeLink: "PASTE_STRIPE_LINK_HERE_ENTERPRISE",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-doc-gold">Power</span>
          </h2>
          <p className="text-doc-text/70 max-w-2xl mx-auto">
            PrimeDox AI pricing. Pre-order now — launching July 2026.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                tier.popular
                  ? "bg-doc-green/10 border-doc-gold shadow-lg shadow-doc-gold/20"
                  : "bg-doc-card border-doc-green/30 hover:border-doc-green/60"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-doc-gold text-doc-dark text-xs font-bold rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <p className="text-doc-text/60 text-sm mt-1">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-doc-gold">{tier.price}</span>
                <span className="text-doc-text/60">{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-doc-text">
                    <Check className="w-5 h-5 text-doc-green shrink-0" />{feature}
                  </li>
                ))}
              </ul>
              <a
                href={tier.stripeLink}
                className={`block w-full py-3 rounded-lg font-bold text-center transition flex items-center justify-center gap-2 ${
                  tier.popular
                    ? "bg-doc-gold text-doc-dark hover:bg-doc-gold/90"
                    : "bg-doc-green/20 text-doc-green border border-doc-green hover:bg-doc-green/30"
                }`}
              >
                {tier.popular ? <Zap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-doc-text/50 text-sm">
            VIGILAX and OmniaGuard pricing available on request.{" "}
            <a href="mailto:franciscoderek7@gmail.com" className="text-doc-gold hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
