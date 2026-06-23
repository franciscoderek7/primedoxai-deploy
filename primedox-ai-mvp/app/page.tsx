import ReferralCapture from "@/components/ReferralCapture";

const TIERS = [
  {
    tier: "starter",
    name: "Starter",
    price: "$49/mo",
    requests: "100 AI requests / month",
    features: ["Document drafting mode", "Summary mode", "Email support"],
  },
  {
    tier: "growth",
    name: "Growth",
    price: "$149/mo",
    requests: "500 AI requests / month",
    features: ["Everything in Starter", "Priority processing", "Referral bonus credits"],
  },
  {
    tier: "empire",
    name: "Empire",
    price: "$499/mo",
    requests: "Unlimited AI requests",
    features: ["Everything in Growth", "Dedicated usage pool", "Priority support"],
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <ReferralCapture />
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">PrimeDox AI</h1>
        <p className="mt-4 text-lg text-gray-400">
          AI-assisted drafting, summaries, and case automation — built for Francisco Holdings Inc. clients.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.tier}
            className="flex flex-col rounded-xl border border-white/10 bg-panel p-6"
          >
            <h2 className="text-xl font-semibold text-white">{t.name}</h2>
            <p className="mt-2 text-3xl font-bold text-accent">{t.price}</p>
            <p className="mt-1 text-sm text-gray-400">{t.requests}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-300">
              {t.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <a
              href={`/api/stripe/checkout?tier=${t.tier}`}
              className="mt-6 rounded-lg bg-accent px-4 py-2 text-center font-medium text-white hover:opacity-90"
            >
              Get {t.name}
            </a>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-gray-500">
        Already have an account? <a href="/login" className="text-accent underline">Log in</a>
      </p>
    </main>
  );
}
