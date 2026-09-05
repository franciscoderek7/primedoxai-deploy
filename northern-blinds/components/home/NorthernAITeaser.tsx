'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Send } from 'lucide-react';

const SAMPLE_QUESTIONS = [
  'What blind style works best for a west-facing cottage window?',
  'How do I measure for roller shades in a bay window?',
  'What\'s the difference between blackout and room-darkening shades?',
];

const SAMPLE_RESPONSE = `Great question. For west-facing cottage windows, you'll want to balance afternoon sun control with your lake view.

I'd recommend solar shades in a 3–5% openness factor — they cut glare significantly while keeping your sightlines to the water. Paired with a quality side channel track to reduce light gaps, you'll have excellent heat control without losing that Northern Ontario atmosphere.

If privacy after sunset matters, consider a day/night roller system that lets you switch between the solar layer and a light-filtering option.

Want me to walk you through measurement and the right mounting for your specific window type?`;

export default function NorthernAITeaser() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleQuestion = (i: number) => {
    setActiveQuestion(i);
    setShowResponse(false);
    setTimeout(() => setShowResponse(true), 800);
  };

  return (
    <section
      className="section-y relative overflow-hidden"
      style={{ background: 'var(--nb-night)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-[50vw] h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 100% 50%, rgba(77,124,94,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[40vw] h-[50%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 0% 100%, rgba(201,160,85,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="container-nb relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="gold-line" />
              <span className="eyebrow">AI-Powered Guidance</span>
            </div>

            <h2
              className="font-display text-white mb-6"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                letterSpacing: '-0.025em',
                lineHeight: '1.1',
              }}
            >
              Meet
              <br />
              <span style={{ color: 'var(--nb-gold)' }}>Northern AI</span>
            </h2>

            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: 'rgba(184,176,166,0.85)' }}
            >
              Ask anything about blinds, windows, or doors. Northern AI gives you
              expert guidance — measurement tips, product comparisons, style advice —
              so you walk into your free consultation already knowing what you want.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                'Instant answers, any time',
                'Product and style recommendations',
                'Measurement guidance before your consultation',
                'No sales pressure — just honest expertise',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: 'rgba(184,176,166,0.7)', fontFamily: 'var(--font-body)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: 'var(--nb-gold)' }}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/northern-ai" className="btn-primary gap-2">
                <Sparkles size={16} />
                Start Chatting Free
              </Link>
              <Link href="/consultation" className="btn-ghost gap-2">
                Book Consultation Instead
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right — chat demo */}
          <div>
            <div
              className="rounded-2xl overflow-hidden border"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-5 py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--nb-gold)', color: 'var(--nb-night)' }}
                >
                  N
                </div>
                <div>
                  <div
                    className="text-sm font-semibold text-white"
                    style={{ fontFamily: 'var(--font-label)' }}
                  >
                    Northern AI
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--nb-sage)' }}
                    />
                    <span
                      className="text-[11px]"
                      style={{ color: 'var(--nb-sage-light)' }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="p-5 space-y-4 min-h-[280px]">
                {/* Opening AI message */}
                <div className="chat-bubble-ai" style={{ background: 'rgba(26,46,32,0.25)', borderColor: 'rgba(77,124,94,0.2)', color: 'rgba(245,240,235,0.85)' }}>
                  <strong style={{ color: 'var(--nb-gold)' }}>Northern AI: </strong>
                  Hi! I'm here to help with any questions about blinds, windows, or doors. What can I help you with today?
                </div>

                {/* Sample questions */}
                {activeQuestion === null && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider px-1" style={{ color: 'rgba(184,176,166,0.4)', fontFamily: 'var(--font-label)' }}>
                      Try asking:
                    </p>
                    {SAMPLE_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuestion(i)}
                        className="w-full text-left text-sm px-4 py-3 rounded-xl border transition-all hover:border-[var(--nb-gold)] hover:bg-[rgba(201,160,85,0.06)]"
                        style={{
                          color: 'rgba(184,176,166,0.75)',
                          borderColor: 'rgba(255,255,255,0.08)',
                          fontFamily: 'var(--font-body)',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected question (user bubble) */}
                {activeQuestion !== null && (
                  <>
                    <div
                      className="chat-bubble-user ml-8"
                      style={{ background: 'var(--nb-gold)', color: 'var(--nb-night)' }}
                    >
                      {SAMPLE_QUESTIONS[activeQuestion]}
                    </div>

                    {!showResponse && (
                      <div className="chat-bubble-ai" style={{ background: 'rgba(26,46,32,0.25)', borderColor: 'rgba(77,124,94,0.2)' }}>
                        <div className="thinking-dots flex gap-1.5 py-1">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    )}

                    {showResponse && (
                      <div
                        className="chat-bubble-ai text-sm leading-relaxed whitespace-pre-line"
                        style={{ background: 'rgba(26,46,32,0.25)', borderColor: 'rgba(77,124,94,0.2)', color: 'rgba(245,240,235,0.85)' }}
                      >
                        <strong style={{ color: 'var(--nb-gold)' }}>Northern AI: </strong>
                        {SAMPLE_RESPONSE}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input bar */}
              <div
                className="px-4 py-4 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <span
                    className="flex-1 text-sm"
                    style={{ color: 'rgba(184,176,166,0.35)', fontFamily: 'var(--font-body)' }}
                  >
                    Ask about blinds, windows, doors...
                  </span>
                  <Link
                    href="/northern-ai"
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
                    style={{ background: 'var(--nb-gold)' }}
                  >
                    <Send size={14} style={{ color: 'var(--nb-night)' }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
