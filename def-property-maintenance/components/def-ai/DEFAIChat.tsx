'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Wrench, Home, Search, Lock, Eye, Cpu, HelpCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const GUIDED_PATHS = [
  { icon: Wrench, label: 'Property Maintenance', q: 'Tell me about property maintenance services.' },
  { icon: Home, label: 'Cottage Care', q: "I need help with my cottage — opening, closing, or ongoing care." },
  { icon: Search, label: 'Property Inspections', q: "What do property inspection visits include?" },
  { icon: Lock, label: 'Locksmith Services', q: "I need locksmith services — what can DEF help with?" },
  { icon: Eye, label: 'Security Services', q: "What security-focused services does DEF offer?" },
  { icon: Cpu, label: 'AI Property 360™', q: "Tell me about AI Property 360™ smart monitoring." },
  { icon: HelpCircle, label: "I'm Not Sure", q: "I'm not sure what I need — can you help me figure it out?" },
];

const OPENING = "Tell us about your property and what you need help with. I can help you figure out which DEF services make sense for your situation, or walk you through AI Property 360™ smart monitoring.";

export default function DEFAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: OPENING },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaths, setShowPaths] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: content.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setShowPaths(false);
    setLoading(true);

    try {
      const res = await fetch('/api/def-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let assistantContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = dec.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const raw = line.slice(6);
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // ignore partial JSON
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again or start a consultation directly." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([{ role: 'assistant', content: OPENING }]);
    setInput('');
    setShowPaths(true);
    setLoading(false);
  };

  const turnCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="flex flex-col h-full max-h-[680px] min-h-[500px]" style={{ background: 'var(--def-slate)', borderRadius: '1rem', border: '1px solid rgba(168,120,64,0.15)' }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(168,120,64,0.15)' }}
          >
            <Cpu size={16} style={{ color: 'var(--def-copper)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-label)' }}>DEF AI</div>
            <div className="text-[10px]" style={{ color: 'var(--def-smoke)' }}>Property Concierge</div>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--def-mist)', fontFamily: 'var(--font-label)' }}
          title="Start over"
        >
          <RefreshCw size={12} />
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] text-sm leading-relaxed px-4 py-3 rounded-2xl"
              style={
                msg.role === 'user'
                  ? { background: 'var(--def-copper)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(240,242,246,0.88)', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--def-copper)', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--def-copper)', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--def-copper)', animationDelay: '300ms' }} />
                </span>
              ) : '')}
            </div>
          </div>
        ))}

        {/* Guided paths — show only at start */}
        {showPaths && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {GUIDED_PATHS.map(({ icon: Icon, label, q }) => (
              <button
                key={label}
                onClick={() => sendMessage(q)}
                className="flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-xs transition-all hover:opacity-80"
                style={{
                  background: 'rgba(168,120,64,0.08)',
                  border: '1px solid rgba(168,120,64,0.15)',
                  color: 'var(--def-cloud)',
                  fontFamily: 'var(--font-label)',
                }}
              >
                <Icon size={13} style={{ color: 'var(--def-copper)', flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Consultation nudge after 3 turns */}
        {turnCount >= 3 && !loading && (
          <div
            className="text-xs px-4 py-3 rounded-xl border text-center"
            style={{ background: 'rgba(168,120,64,0.06)', borderColor: 'rgba(168,120,64,0.15)', color: 'var(--def-smoke)' }}
          >
            Ready to move forward?{' '}
            <Link href="/consultation" className="font-semibold" style={{ color: 'var(--def-copper)' }}>
              Start a property consultation
            </Link>
            {' '}and Dylan will review your needs directly.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 pb-4 pt-2 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 1200))}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your property…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm resize-none outline-none"
            style={{ color: 'rgba(240,242,246,0.9)', caretColor: 'var(--def-copper)', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: 'var(--def-copper)' }}
          >
            <Send size={14} color="white" />
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: 'rgba(155,163,184,0.35)', fontFamily: 'var(--font-label)' }}>
          DEF AI assists with general questions only — not a licensed advisor. For emergencies call 911.
        </p>
      </form>
    </div>
  );
}
