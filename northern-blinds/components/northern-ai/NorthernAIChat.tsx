'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  'What blind types work best for a lakefront cottage?',
  'How do I measure windows for roller shades?',
  'What\'s the difference between motorized and manual blinds?',
  'Do you install in [PLACEHOLDER — enter your town]?',
  'What energy-efficient window options do you carry?',
  'How long does installation typically take?',
];

export default function NorthernAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/northern-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });

      if (!response.ok) {
        throw new Error('Northern AI is temporarily unavailable. Please try again shortly.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? '';
                if (delta) {
                  assistantContent += delta;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip malformed SSE chunks
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setMessages((prev) =>
        prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="container-nb py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="gold-line" />
            <span className="eyebrow">AI Expert</span>
            <span className="gold-line" />
          </div>
          <h1
            className="font-display text-white mb-3"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              letterSpacing: '-0.025em',
            }}
          >
            Northern <span style={{ color: 'var(--nb-gold)' }}>AI</span>
          </h1>
          <p className="text-base" style={{ color: 'rgba(184,176,166,0.7)' }}>
            Your expert guide for blinds, windows, and doors. Ask anything.
          </p>
        </div>

        {/* Chat window */}
        <div
          className="rounded-2xl border overflow-hidden mb-4"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          {/* Messages */}
          <div className="p-6 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">

            {messages.length === 0 && (
              <div className="text-center py-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-display"
                  style={{ background: 'rgba(201,160,85,0.15)', color: 'var(--nb-gold)' }}
                >
                  N
                </div>
                <p className="text-base text-white mb-1 font-display">
                  Hi, I&apos;m Northern AI
                </p>
                <p className="text-sm mb-6" style={{ color: 'rgba(184,176,166,0.55)' }}>
                  Ask me anything about blinds, windows, or doors.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto text-left">
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="text-sm px-4 py-3 rounded-xl border transition-all text-left hover:border-[var(--nb-gold)] hover:bg-[rgba(201,160,85,0.06)]"
                      style={{
                        color: 'rgba(184,176,166,0.7)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                {msg.role === 'user' ? (
                  <div
                    className="chat-bubble-user max-w-[80%]"
                    style={{ background: 'var(--nb-gold)', color: 'var(--nb-night)' }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex gap-3 max-w-[88%]">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                      style={{ background: 'rgba(201,160,85,0.2)', color: 'var(--nb-gold)' }}
                    >
                      N
                    </div>
                    <div
                      className="chat-bubble-ai"
                      style={{
                        background: 'rgba(26,46,32,0.25)',
                        borderColor: 'rgba(77,124,94,0.2)',
                        color: 'rgba(245,240,235,0.85)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.content || (
                        <div className="thinking-dots flex gap-1.5 py-0.5">
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                  style={{ background: 'rgba(201,160,85,0.2)', color: 'var(--nb-gold)' }}
                >
                  N
                </div>
                <div
                  className="chat-bubble-ai"
                  style={{ background: 'rgba(26,46,32,0.25)', borderColor: 'rgba(77,124,94,0.2)' }}
                >
                  <div className="thinking-dots flex gap-1.5 py-0.5">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div
                className="text-sm px-4 py-3 rounded-xl border"
                style={{
                  color: '#e87a7a',
                  borderColor: 'rgba(232,122,122,0.2)',
                  background: 'rgba(232,122,122,0.05)',
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            className="px-4 pb-4 pt-3 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about blinds, windows, doors..."
                className="flex-1 text-sm px-4 py-3 rounded-xl border outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(245,240,235,0.9)',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--nb-gold)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                disabled={isLoading}
                autoComplete="off"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
                style={{ background: 'var(--nb-gold)', flexShrink: 0 }}
              >
                <Send size={16} style={{ color: 'var(--nb-night)' }} />
              </button>
            </form>
          </div>
        </div>

        {/* Consultation nudge */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-xl border"
          style={{
            background: 'rgba(201,160,85,0.06)',
            borderColor: 'rgba(201,160,85,0.2)',
          }}
        >
          <p className="text-sm" style={{ color: 'rgba(184,176,166,0.75)' }}>
            Ready to see products in person?
          </p>
          <Link
            href="/consultation"
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--nb-gold)', fontFamily: 'var(--font-label)', flexShrink: 0, marginLeft: '1rem' }}
          >
            Book Free Consultation
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Disclaimer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: 'rgba(184,176,166,0.3)', fontFamily: 'var(--font-label)' }}
        >
          Northern AI provides general guidance only. For accurate quotes, measurements, and product availability, book a free in-home consultation.
        </p>

      </div>
    </div>
  );
}
