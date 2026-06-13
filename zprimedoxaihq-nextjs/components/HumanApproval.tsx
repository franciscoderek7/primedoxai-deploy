'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Edit3, AlertTriangle, FileText, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { langGraph, type PendingApproval } from '@/lib/langgraph';
import { clsx } from 'clsx';

interface Props {
  approval: PendingApproval;
  onDecision: (action: 'approve' | 'reject' | 'revision', threadId: string) => void;
}

type Action = 'approve' | 'reject' | 'revision';

export default function HumanApproval({ approval, onDecision }: Props) {
  const [action, setAction] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState('');
  const [editedDoc, setEditedDoc] = useState(approval.draft_document || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docExpanded, setDocExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const score = approval.compliance_score;
  const scoreLabel =
    score === null ? null :
    score >= 0.8 ? 'Compliant' :
    score >= 0.6 ? 'Marginal' : 'At Risk';
  const scoreColor =
    score === null ? 'text-doc-text/40' :
    score >= 0.8 ? 'text-doc-green' :
    score >= 0.6 ? 'text-doc-gold' : 'text-red-400';

  async function submit() {
    if (!action) return;
    setLoading(true);
    setError(null);
    try {
      await langGraph.resume(approval.thread_id, {
        action,
        feedback: feedback || undefined,
        edited_document: action === 'revision' ? editedDoc : undefined,
        approved_by: 'Doc',
      });
      setSubmitted(true);
      onDecision(action, approval.thread_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-doc-card border border-doc-green/30 rounded-xl p-5 text-center space-y-2">
        <CheckCircle size={32} className="text-doc-green mx-auto" />
        <p className="text-doc-green font-semibold">Decision submitted — workflow resuming</p>
        <p className="text-doc-text/50 text-sm capitalize">{action}d · {approval.thread_id.slice(0, 8)}…</p>
      </div>
    );
  }

  return (
    <div className="bg-doc-card border border-doc-gold/40 rounded-xl overflow-hidden">
      {/* Gate header */}
      <div className="bg-doc-gold/10 border-b border-doc-gold/30 px-5 py-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-doc-gold animate-pulse" />
        <span className="text-doc-gold font-semibold text-sm">Human Gate — Awaiting Doc</span>
        <span className="ml-auto text-doc-text/40 text-xs font-mono">{approval.thread_id.slice(0, 8)}…</span>
      </div>

      <div className="p-5 space-y-4">

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <FileText size={13} className="text-doc-green/70" />
            <span className="text-doc-text/50 text-xs">Type:</span>
            <span className="text-doc-text font-medium capitalize text-xs">
              {approval.document_type || 'Document'}
            </span>
          </div>
          {score !== null && (
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-doc-green/70" />
              <span className="text-doc-text/50 text-xs">Compliance:</span>
              <span className={clsx('font-bold text-xs', scoreColor)}>
                {Math.round(score * 100)}% · {scoreLabel}
              </span>
            </div>
          )}
          {approval.domain && (
            <div className="flex items-center gap-1.5">
              <span className="text-doc-text/50 text-xs">Domain:</span>
              <span className="text-doc-green font-medium text-xs capitalize">{approval.domain}</span>
            </div>
          )}
        </div>

        {/* Red flags */}
        {approval.red_flags && approval.red_flags.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
              <AlertTriangle size={12} />
              {approval.red_flags.length} Red Flag{approval.red_flags.length !== 1 ? 's' : ''}
            </div>
            {approval.red_flags.map((f, i) => (
              <p key={i} className="text-red-300/80 text-xs pl-3 border-l-2 border-red-500/40 leading-relaxed">
                {f}
              </p>
            ))}
          </div>
        )}

        {/* Review memo */}
        {approval.review_memo && (
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-doc-text/40 text-xs font-semibold uppercase tracking-wider mb-1">Review Memo</p>
            <p className="text-doc-text/80 text-sm leading-relaxed">{approval.review_memo}</p>
          </div>
        )}

        {/* Document */}
        {approval.draft_document && (
          <div>
            <button
              onClick={() => setDocExpanded(v => !v)}
              className="flex items-center gap-1.5 text-doc-text/50 text-xs font-semibold uppercase tracking-wider mb-2 hover:text-doc-text/80 transition-colors"
            >
              Draft Document
              {docExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {!docExpanded && (
                <span className="text-doc-text/30 normal-case font-normal ml-1">
                  ({Math.ceil((approval.draft_document?.length ?? 0) / 5)} words)
                </span>
              )}
            </button>

            {docExpanded && (
              action === 'revision' ? (
                <textarea
                  className="w-full h-72 bg-white/5 border border-doc-border/30 rounded-lg p-3 text-doc-text text-xs font-mono resize-y focus:outline-none focus:border-doc-gold/60 transition-colors"
                  value={editedDoc}
                  onChange={e => setEditedDoc(e.target.value)}
                />
              ) : (
                <div className="bg-white/5 border border-doc-border/20 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <pre className="text-doc-text/75 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {approval.draft_document}
                  </pre>
                </div>
              )
            )}
          </div>
        )}

        {/* Feedback area */}
        {(action === 'reject' || action === 'revision') && (
          <div>
            <p className="text-doc-text/40 text-xs font-semibold uppercase tracking-wider mb-2">
              {action === 'revision' ? 'Revision Instructions' : 'Rejection Reason'}
            </p>
            <textarea
              className="w-full h-20 bg-white/5 border border-doc-border/30 rounded-lg p-3 text-doc-text text-sm resize-none focus:outline-none focus:border-doc-gold/60 transition-colors"
              placeholder={
                action === 'revision' ? 'What needs to change? Be specific.' : 'Why is this rejected?'
              }
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {(['approve', 'revision', 'reject'] as Action[]).map(a => {
            const cfg = {
              approve: {
                icon: <CheckCircle size={14} />,
                label: 'Approve',
                active: 'bg-doc-green text-white ring-2 ring-doc-green ring-offset-1 ring-offset-doc-card',
                idle: 'bg-doc-green/15 text-doc-green hover:bg-doc-green/25',
              },
              revision: {
                icon: <Edit3 size={14} />,
                label: 'Request Edit',
                active: 'bg-doc-gold text-black ring-2 ring-doc-gold ring-offset-1 ring-offset-doc-card',
                idle: 'bg-doc-gold/15 text-doc-gold hover:bg-doc-gold/25',
              },
              reject: {
                icon: <XCircle size={14} />,
                label: 'Reject',
                active: 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-1 ring-offset-doc-card',
                idle: 'bg-red-500/15 text-red-400 hover:bg-red-500/25',
              },
            }[a];

            return (
              <button
                key={a}
                onClick={() => { setAction(a); if (a === 'approve') setDocExpanded(true); }}
                className={clsx(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  action === a ? cfg.active : cfg.idle
                )}
              >
                {cfg.icon} {cfg.label}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded px-3 py-2">{error}</p>
        )}

        {/* Submit */}
        {action && (
          <button
            onClick={submit}
            disabled={loading || (action !== 'approve' && !feedback && action === 'reject')}
            className="w-full py-2.5 bg-doc-green text-white font-semibold rounded-lg hover:bg-doc-green/90 disabled:opacity-40 transition-colors text-sm"
          >
            {loading
              ? 'Submitting…'
              : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
          </button>
        )}
      </div>
    </div>
  );
}
