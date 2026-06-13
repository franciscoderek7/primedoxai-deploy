'use client';

import { clsx } from 'clsx';

// ─── Node pipelines per domain ────────────────────────────────────────────

const PIPELINES: Record<string, string[]> = {
  legal: ['intake', 'research', 'constitutional', 'strategy', 'draft', 'review', 'human_gate', 'deliver'],
  cyber: ['intake', 'enrichment', 'impact_analysis', 'containment_strategy', 'draft', 'review', 'human_gate', 'remediation', 'deliver'],
  safety: ['intake', 'triage', 'protocol_match', 'resource_deployment', 'constitutional_check', 'review', 'human_gate', 'documentation', 'deliver', 'follow_up'],
  business: ['intake', 'market_analysis', 'empire_synergy', 'risk_assessment', 'strategy', 'draft', 'review', 'human_gate', 'deliver'],
  default: ['intake', 'research', 'draft', 'review', 'human_gate', 'deliver'],
};

const NODE_LABELS: Record<string, string> = {
  intake: 'Intake',
  research: 'Research',
  constitutional: 'Constitutional',
  constitutional_check: 'Charter Check',
  strategy: 'Strategy',
  draft: 'Draft',
  review: 'Review',
  human_gate: 'Human Gate',
  deliver: 'Deliver',
  enrichment: 'Enrichment',
  impact_analysis: 'Impact',
  containment_strategy: 'Containment',
  remediation: 'Remediation',
  triage: 'Triage',
  protocol_match: 'Protocol',
  resource_deployment: 'Resources',
  documentation: 'Docs',
  follow_up: 'Follow-Up',
  market_analysis: 'Market',
  empire_synergy: 'Synergy',
  risk_assessment: 'Risk',
};

// ─── Types ────────────────────────────────────────────────────────────────

export type WorkflowDisplayStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

interface Props {
  domain: string | null;
  currentNode: string | null;
  status: WorkflowDisplayStatus;
  threadId?: string;
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function WorkflowStatus({ domain, currentNode, status, threadId, compact }: Props) {
  const pipeline = PIPELINES[domain || 'default'] ?? PIPELINES.default;
  const activeIdx = currentNode ? pipeline.indexOf(currentNode) : -1;
  const pct = status === 'complete'
    ? 100
    : activeIdx >= 0
    ? Math.round(((activeIdx + 1) / pipeline.length) * 100)
    : 0;

  return (
    <div className="bg-doc-card border border-doc-border/30 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-doc-text font-semibold text-xs uppercase tracking-widest">
            {compact ? 'Workflow' : 'Workflow Pipeline'}
          </h3>
          {domain && (
            <span className="px-1.5 py-0.5 bg-doc-green/20 text-doc-green rounded text-xs capitalize">
              {domain}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {threadId && (
            <span className="text-doc-text/30 text-xs font-mono">{threadId.slice(0, 8)}…</span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Pipeline nodes */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {pipeline.map((node, idx) => {
            const isActive = idx === activeIdx;
            const isDone = activeIdx >= 0 ? idx < activeIdx : status === 'complete';
            const isGate = node === 'human_gate';

            return (
              <div key={node} className="flex items-center gap-1">
                <div
                  className={clsx(
                    'px-2 py-0.5 rounded text-xs font-medium transition-all duration-300 whitespace-nowrap',
                    isActive && status === 'paused' && isGate &&
                      'bg-doc-gold text-black ring-2 ring-doc-gold ring-offset-1 ring-offset-doc-card',
                    isActive && !(status === 'paused' && isGate) &&
                      'bg-doc-green text-white ring-2 ring-doc-green ring-offset-1 ring-offset-doc-card animate-pulse',
                    isDone && !isActive && 'bg-doc-green/20 text-doc-green',
                    !isActive && !isDone && isGate && 'bg-doc-gold/10 text-doc-gold/60 border border-doc-gold/20',
                    !isActive && !isDone && !isGate && 'bg-white/5 text-doc-text/30',
                  )}
                >
                  {isDone && !isActive ? '✓ ' : isActive && isGate ? '🔐 ' : ''}
                  {NODE_LABELS[node] ?? node}
                </div>
                {idx < pipeline.length - 1 && (
                  <span className={clsx('text-xs leading-none', isDone ? 'text-doc-green/60' : 'text-white/15')}>
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-doc-text/40 mb-1">
          <span>
            {status === 'paused' ? '⏸ Awaiting approval at Human Gate' :
             status === 'complete' ? '✓ Complete' :
             status === 'error' ? '✗ Error' :
             currentNode ? `Running: ${NODE_LABELS[currentNode] ?? currentNode}` : 'Idle'}
          </span>
          <span className="font-mono">{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700',
              status === 'error' ? 'bg-red-500' :
              status === 'paused' ? 'bg-doc-gold' :
              'bg-doc-green'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: WorkflowDisplayStatus }) {
  const map: Record<WorkflowDisplayStatus, { label: string; cls: string }> = {
    running: { label: '● Running', cls: 'bg-blue-500/20 text-blue-400 animate-pulse' },
    paused:  { label: '⏸ Awaiting', cls: 'bg-doc-gold/20 text-doc-gold' },
    complete:{ label: '✓ Complete', cls: 'bg-doc-green/20 text-doc-green' },
    error:   { label: '✗ Error',   cls: 'bg-red-500/20 text-red-400' },
    idle:    { label: 'Idle',      cls: 'bg-white/10 text-doc-text/40' },
  };
  const { label, cls } = map[status];
  return <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', cls)}>{label}</span>;
}
