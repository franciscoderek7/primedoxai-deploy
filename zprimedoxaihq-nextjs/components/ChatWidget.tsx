"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  domain?: string;
}

function classifyDomain(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/court|law|constitutional|cannabis|filing|motion|affidavit|claim|litigation/)) return "legal";
  if (lower.match(/hack|threat|security|breach|firewall|malware|cyber/)) return "cyber";
  if (lower.match(/police|ems|fire|crime|triage|ambulance|responder/)) return "safety";
  if (lower.match(/business|revenue|strategy|investment|empire|company/)) return "business";
  return "general";
}

function getSystemPrompt(domain: string): string {
  const prompts: Record<string, string> = {
    legal:    "You are PrimeDox AI, a constitutional cannabis law expert trained on 20+ years of Doc Weedlaw's advocacy. Provide accurate legal information. Always include: 'This is not legal advice. Consult a licensed attorney.'",
    cyber:    "You are VIGILAX, a cybersecurity threat intelligence engine. Provide actionable security guidance with technical precision.",
    safety:   "You are OmniaGuard, a public safety AI for first responders. Provide protocol-compliant recommendations with constitutional safeguards. Always flag potential civil liberties issues.",
    business: "You are Francisco Holdings AI, an empire management system. Provide strategic business advice focused on growth, litigation leverage, and generational wealth.",
    general:  "You are zPrimeDox AI, a helpful assistant built by Doc Weedlaw for the 45+ company empire.",
  };
  return prompts[domain] || prompts.general;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to zPrimeDox AI HQ. I'm your intelligence engine. What do you need?", domain: "general" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    const domain = classifyDomain(userMsg);
    setCurrentDomain(domain);
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, domain, systemPrompt: getSystemPrompt(domain) }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response || "I'm processing your request. The full engine launches soon.",
        domain,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection issue. The full zPrimeDox AI engine is launching July 2026. Pre-order now for priority access.",
        domain: "general",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const domainColors: Record<string, string> = {
    legal:    "text-blue-400",
    cyber:    "text-red-400",
    safety:   "text-amber-400",
    business: "text-purple-400",
    general:  "text-doc-gold",
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-doc-green hover:bg-doc-gold text-white hover:text-doc-dark transition-all duration-300 shadow-lg shadow-doc-green/40 flex items-center justify-center animate-glow"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-doc-card border border-doc-green/40 rounded-xl shadow-2xl shadow-doc-green/20 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-doc-green/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-doc-gold" />
              <span className="font-bold text-white">zPrimeDox AI</span>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-doc-dark border ${domainColors[currentDomain]}`}>
                {currentDomain}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-doc-green/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-doc-green" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-doc-green/20 text-white"
                    : "bg-doc-dark border border-doc-gold/30 text-doc-text"
                }`}>
                  {msg.content}
                  {msg.domain && msg.role === "assistant" && (
                    <div className="text-xs mt-1 opacity-50">via {msg.domain}</div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-doc-gold/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-doc-gold" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-doc-green/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-doc-green animate-pulse" />
                </div>
                <div className="bg-doc-dark border border-doc-gold/30 p-3 rounded-lg text-sm text-doc-text/50">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-doc-green/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2 rounded-lg bg-doc-dark border border-doc-green/30 text-white placeholder-doc-text/40 focus:outline-none focus:border-doc-gold text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="px-3 py-2 bg-doc-green text-white rounded-lg hover:bg-doc-green/80 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-doc-text/30 mt-2 text-center">
              Powered by zPrimeDox AI HQ • Not legal/medical advice
            </p>
          </div>
        </div>
      )}
    </>
  );
}
