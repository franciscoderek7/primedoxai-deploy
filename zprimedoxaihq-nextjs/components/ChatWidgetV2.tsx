'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, CheckCircle, Clock } from 'lucide-react';
import { langGraph, pollUntilDone, type StateResponse, type PendingApproval } from '@/lib/langgraph';
import HumanApproval from '@/components/HumanApproval';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  node?: string;
  threadId?: string;
}

type Phase =
  | 'idle'
  | 'starting'
  | 'running'
  | 'paused'
  | 'resuming'
  | 'complete'
  | 'error';

const NODE_DESCRIPTIONS: Record<string, string> = {
  intake: 'Analysing your query…',
  research: 'Searching knowledge base…',
  constitutional: 'Running constitutional analysis…',
  constitutional_check: 'Charter compliance check…',
  strategy: 'Building strategic options…',
  draft: 'Drafting document…',
  review: 'Reviewing for compliance…',
  human_gate: 'Waiting for Doc approval…',
  deliver: 'Delivering final document…',
  enrichment: 'Enriching threat data…',
  impact_analysis: 'Assessing business impact…',
  containment_strategy: 'Building containment playbook…',
  remediation: 'Planning remediation…',
  triage: 'Triaging incident…',
  protocol_match: 'Matching SOPs…',
  resource_deployment: 'Planning deployment…',
  documentation: 'Generating documentation…',
  follow_up: 'Scheduling follow-up…',
  market_analysis: 'Analysing market…',
  empire_synergy: 'Mapping empire synergies…',
  risk_assessment: 'Assessing risks…',
};

// ─── Component ────────────────────────────────────────────────────────────

export default function ChatWidgetV2() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "zPrimeDox AI HQ online. What legal, cyber, safety, or business intelligence do you need?",
    },
  ]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  useEffect(() => {
    return () => stopPollRef.current?.();
  }, []);

  function pushMessage(msg: Omit<Message, 'id'>) {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString() + Math.random() }]);
  }

  function handleStateUpdate(state: StateResponse) {
    setCurrentNode(state.current_node);

    if (state.status === 'paused') {
      setPhase('paused');
      stopPollRef.current?.();
      // Fetch pending approval details
      langGraph.getPending(state.thread_id).then(setPendingApproval).catch(() => null);
    } else if (state.complete) {
      setPhase('complete');
      stopPollRef.current?.();
      setCurrentNode(null);
      if (state.draft_document) {
        pushMessage({
          role: 'assistant',
          content: state.draft_document,
          threadId: state.thread_id,
        });
      } else {
        pushMessage({
          role: 'assistant',
          content: '✓ Workflow complete. Document delivered.',
          threadId: state.thread_id,
        });
      }
    } else if (state.status === 'error') {
      setPhase('error');
      stopPollRef.current?.();
      pushMessage({
        role: 'system',
        content: `Error: ${state.error || 'Workflow failed'}`,
      });
    }
  }

  async function send() {
    const query = input.trim();
    if (!query || phase === 'running' || phase === 'starting') return;

    setInput('');
    pushMessage({ role: 'user', content: query });
    setPhase('starting');
    setCurrentNode(null);
    setPendingApproval(null);
    stopPollRef.current?.();

    try {
      const run = await langGraph.startRun({ query });
      setThreadId(run.thread_id);

      if (run.status === 'paused') {
        setPhase('paused');
        const pending = await langGraph.getPending(run.thread_id).catch(() => null);
        setPendingApproval(pending);
      } else if (run.status === 'complete') {
        setPhase('complete');
        handleStateUpdate(await langGraph.getStatus(run.thread_id));
      } else {
        setPhase('running');
        const stop = pollUntilDone(run.thread_id, handleStateUpdate, 2500);
        stopPollRef.current = stop;
      }
    } catch (e) {
      setPhase('error');
      pushMessage({
        role: 'system',
        content: `Connection error: ${e instanceof Error ? e.message : 'Could not reach AI engine'}`,
      });
    }
  }

  function handleApprovalDecision(action: 'approve' | 'reject' | 'revision') {
    setPhase('resuming');
    setPendingApproval(null);
    pushMessage({
      role: 'system',
      content: `Doc ${action}d · workflow resuming…`,
    });
    // Re-start polling to catch final state
    if (threadId) {
      const stop = pollUntilDone(threadId, handleStateUpdate, 2000);
      stopPollRef.current = stop;
    }
  }

  const activeNodeDesc = currentNode ? NODE_DESCRIPTIONS[currentNode] : null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
          'bg-doc-green hover:bg-doc-green/90',
          open && 'rotate-90'
        )}
        aria-label="Toggle AI chat"
      >
        {open ? <X size={22} className="text-white" /> : <MessageSquare size={22} className="text-white" />}
        {phase === 'paused' && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-doc-gold rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] flex flex-col bg-doc-card border border-doc-border/40 rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '80vh' }}>

          {/* Header */}
          <div className="bg-doc-green/10 border-b border-doc-border/30 px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-doc-green animate-pulse" />
            <span className="text-doc-text font-semibold text-sm">zPrimeDox AI</span>
            {phase === 'running' && (
              <span className="ml-auto flex items-center gap-1.5 text-blue-400 text-xs">
                <Loader2 size={11} className="animate-spin" />
                {activeNodeDesc || 'Processing…'}
              </span>
            )}
            {phase === 'paused' && (
              <span className="ml-auto flex items-center gap-1.5 text-doc-gold text-xs">
                <Clock size={11} />
                Awaiting Doc
              </span>
            )}
            {phase === 'resuming' && (
              <span className="ml-auto flex items-center gap-1.5 text-blue-400 text-xs">
                <Loader2 size={11} className="animate-spin" />
                Resuming…
              </span>
            )}
            {phase === 'complete' && (
              <span className="ml-auto flex items-center gap-1.5 text-doc-green text-xs">
                <CheckCircle size={11} />
                Complete
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={clsx(
                  'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user' && 'ml-auto bg-doc-green/20 text-doc-text',
                  msg.role === 'assistant' && 'bg-white/8 text-doc-text/90',
                  msg.role === 'system' && 'mx-auto text-center bg-doc-gold/10 text-doc-gold/80 text-xs rounded-lg',
                )}
              >
                {msg.role === 'assistant' && msg.content.length > 800 ? (
                  <ExpandableText text={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.threadId && (
                  <p className="text-doc-text/25 text-xs mt-1 font-mono">{msg.threadId.slice(0, 8)}…</p>
                )}
              </div>
            ))}

            {/* Thinking indicator */}
            {(phase === 'starting' || phase === 'running') && (
              <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3.5 py-2.5">
                <Loader2 size={14} className="animate-spin text-doc-green flex-shrink-0" />
                <div>
                  <p className="text-doc-text/70 text-xs font-medium">
                    {phase === 'starting' ? 'Starting workflow…' : (activeNodeDesc || 'Processing…')}
                  </p>
                  {currentNode && (
                    <p className="text-doc-text/35 text-xs font-mono mt-0.5">{currentNode}</p>
                  )}
                </div>
              </div>
            )}

            {/* Human approval card */}
            {phase === 'paused' && pendingApproval && (
              <div className="mt-2">
                <HumanApproval approval={pendingApproval} onDecision={handleApprovalDecision} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-doc-border/30 p-3">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 bg-white/5 border border-doc-border/30 rounded-xl px-3 py-2.5 text-doc-text text-sm resize-none focus:outline-none focus:border-doc-green/60 transition-colors min-h-[40px] max-h-32"
                placeholder="Ask anything — legal, cyber, safety, business…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                disabled={phase === 'running' || phase === 'starting' || phase === 'resuming'}
              />
              <button
                onClick={send}
                disabled={!input.trim() || phase === 'running' || phase === 'starting' || phase === 'resuming'}
                className="w-10 h-10 bg-doc-green rounded-xl flex items-center justify-center hover:bg-doc-green/90 disabled:opacity-40 transition-colors flex-shrink-0"
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Expandable long text ─────────────────────────────────────────────────

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = text.slice(0, 400);
  return (
    <div>
      <p className="whitespace-pre-wrap">{expanded ? text : `${preview}…`}</p>
      <button
        onClick={() => setExpanded(v => !v)}
        className="text-doc-green/70 text-xs mt-1.5 hover:text-doc-green transition-colors"
      >
        {expanded ? 'Show less ↑' : 'Read full document ↓'}
      </button>
    </div>
  );
}
