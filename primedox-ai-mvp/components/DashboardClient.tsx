"use client";

import { useState } from "react";

type Props = {
  email: string;
  tier: string;
  subscriptionStatus: string;
  current: number;
  limit: number;
  modes: string[];
  referralLink: string;
};

export default function DashboardClient({
  email,
  tier,
  subscriptionStatus,
  current,
  limit,
  modes,
  referralLink,
}: Props) {
  const [mode, setMode] = useState(modes[0] ?? "default");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [usage, setUsage] = useState({ current, limit });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Request failed.");
      if (data.upgrade_to) {
        setError(`${data.error} Upgrade to ${data.upgrade_to} for more requests.`);
      }
      setLoading(false);
      return;
    }

    setOutput(data.output);
    setUsage({ current: data.usage.current, limit: data.usage.limit });
    setLoading(false);
  }

  function copyReferral() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const usagePct = Math.min(100, Math.round((usage.current / usage.limit) * 100));

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">PrimeDox AI Dashboard</h1>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {tier} · {subscriptionStatus}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{email}</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-panel p-4">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Usage this month</span>
            <span>
              {usage.current} / {usage.limit >= 999999 ? "∞" : usage.limit}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/5">
            <div
              className="h-2 rounded-full bg-accent"
              style={{ width: `${usage.limit >= 999999 ? 5 : usagePct}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-white/10 bg-panel p-4">
          <div>
            <label className="text-sm text-gray-400">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-white"
            >
              {modes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-white placeholder:text-gray-500"
              placeholder="Describe what you need..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>

        {output && (
          <div className="mt-6 rounded-xl border border-white/10 bg-panel p-4">
            <h2 className="text-sm font-medium text-gray-400">Output</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-200">{output}</p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-white/10 bg-panel p-4">
          <h2 className="text-sm font-medium text-gray-400">Your referral link</h2>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-gray-300"
            />
            <button
              onClick={copyReferral}
              type="button"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
