"use client";

import { useState } from "react";
import { saveLead } from "@/lib/supabase";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await saveLead({ email, name: name || undefined });
      setSubmitted(true);
    } catch {
      alert("Error saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-doc-green/10 via-transparent to-doc-gold/10" />
      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-doc-green/20 border border-doc-green/40 text-doc-gold text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>45+ Companies. One Empire. Infinite Power.</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          zPrimeDox <span className="text-doc-gold">AI HQ</span>
        </h1>
        <p className="text-xl md:text-2xl text-doc-text mb-4 max-w-3xl mx-auto">
          The World&apos;s First Cannabis Constitutional Intelligence Engine
        </p>
        <p className="text-lg text-doc-text/70 mb-10 max-w-2xl mx-auto">
          One brain. Five powers. Built by Doc Weedlaw — 20+ Years Constitutional Advocacy.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-lg bg-doc-card border border-doc-green/30 text-white placeholder-doc-text/50 focus:outline-none focus:border-doc-gold"
              />
              <input
                type="email"
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-3 rounded-lg bg-doc-card border border-doc-green/30 text-white placeholder-doc-text/50 focus:outline-none focus:border-doc-gold"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-doc-gold text-doc-dark font-bold rounded-lg hover:bg-doc-gold/90 transition flex items-center justify-center gap-2 animate-glow"
              >
                {loading ? "Saving..." : (
                  <><Zap className="w-5 h-5" />Get Early Access<ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-md mx-auto p-6 bg-doc-green/20 border border-doc-green rounded-lg">
            <p className="text-doc-gold font-bold text-lg">You&apos;re on the list!</p>
            <p className="text-doc-text mt-2">We&apos;ll notify you when zPrimeDox AI HQ launches. Welcome to the empire.</p>
          </div>
        )}
      </div>
    </section>
  );
}
