'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Send, MessageCircle } from 'lucide-react';

const GUIDED_PATHS = [
  { label: 'Property Maintenance', icon: '🔧' },
  { label: 'Cottage Care', icon: '🏡' },
  { label: 'Property Inspection', icon: '🔍' },
  { label: 'AI Property 360™', icon: '📡' },
  { label: 'Locksmith Services', icon: '🔑' },
  { label: "I'm Not Sure", icon: '💬' },
];

const DEMO_RESPONSE = `I can help with that. Here's what cottage care at DEF typically covers:

**Seasonal Opening** — We walk through the property, check for winter damage, start up water systems, test appliances and smoke/CO detectors, and clear any exterior issues.

**Regular Check-ins** — Periodic visits through the season. We send you a report with photos after each visit.

**Seasonal Closing** — Draining water systems, winterizing, securing the property, and a final walkthrough before you leave.

**AI Property 360™ add-on** — Remote monitoring through the off-season so you know what's happening at the cottage year-round.

What would be most helpful — should I start a property consultation, or do you have specific questions about the cottage?`;

export default function DEFAITeaser() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handlePath = (label: string) => {
    setSelectedPath(label);
    setShowResponse(false);
    setTimeout(() => setShowResponse(true), 900);
  };

  return (
    <section className="section-y" style={{ background: 'var(--surface-muted)' }}>
      <div className="container-def">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — chat demo */}
          <div>
            <div
              className="rounded-2xl overflow-hidden border shadow-card"
              style={{ background: 'white', borderColor: 'var(--border-light)' }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--def-slate)' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display"
                  style={{ background: 'var(--def-copper)', color: 'white' }}
                >
                  D
                </div>
                <div>
                  <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-label)' }}>
                    DEF AI
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot-green" />
                    <span className="text-[11px]" style={{ color: 'var(--def-sage)' }}>Property Concierge</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[300px]">
                <div className="chat-bubble-ai">
                  <strong style={{ color: 'var(--def-copper)' }}>DEF AI: </strong>
                  Tell me about your property and what you need help with. Or choose a path below to get started.
                </div>

                {!selectedPath && (
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wider px-1" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}>
                      What can we help with?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {GUIDED_PATHS.map((path) => (
                        <button
                          key={path.label}
                          onClick={() => handlePath(path.label)}
                          className="flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-lg border transition-all hover:border-[var(--def-copper)] hover:bg-[rgba(168,120,64,0.04)]"
                          style={{ borderColor: 'var(--border-light)', color: 'var(--def-stone)', fontFamily: 'var(--font-body)' }}
                        >
                          <span>{path.icon}</span>
                          <span>{path.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPath && (
                  <>
                    <div className="chat-bubble-user" style={{ background: 'var(--def-copper)' }}>
                      {selectedPath}
                    </div>
                    {!showResponse && (
                      <div className="chat-bubble-ai">
                        <div className="thinking-dots flex gap-1.5 py-1"><span /><span /><span /></div>
                      </div>
                    )}
                    {showResponse && (
                      <div className="chat-bubble-ai text-sm whitespace-pre-wrap">
                        <strong style={{ color: 'var(--def-copper)' }}>DEF AI: </strong>
                        {DEMO_RESPONSE}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                  <span className="flex-1 text-sm" style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-body)' }}>
                    Describe your property or ask a question...
                  </span>
                  <Link
                    href="/def-ai"
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--def-copper)' }}
                  >
                    <Send size={13} className="text-white" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right — copy */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="copper-line" />
              <span className="eyebrow">Property Concierge</span>
            </div>

            <h2
              className="font-display mb-3"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', letterSpacing: '-0.025em', lineHeight: '1.1', color: 'var(--def-night)' }}
            >
              Meet
              <br />
              <span style={{ color: 'var(--def-copper)' }}>DEF AI</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--def-stone)' }}>
              DEF AI is your property concierge — available any time to answer questions, qualify your
              needs, and route your request to the right DEF service. Start here, and Dylan&apos;s team picks up from there.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                'Guided service selection — no wrong door',
                'Property qualification before your consultation',
                'AI Property 360™ recommendations',
                'Human DEF team handles everything after',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--def-stone)' }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--def-copper)' }} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/def-ai" className="btn-primary gap-2">
                <MessageCircle size={16} />
                Talk to DEF AI
              </Link>
              <Link href="/consultation" className="btn-outline-dark gap-2">
                Skip to Consultation <ArrowRight size={15} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
