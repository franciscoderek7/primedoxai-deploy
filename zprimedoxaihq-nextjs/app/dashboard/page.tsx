'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Clock, CheckCircle, AlertCircle, Activity,
  Database, RefreshCw, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { langGraph, type WorkflowRun, type PendingApproval, type StateResponse } from '@/lib/langgraph';
import {
  fetchSessions, fetchMemoryStats, subscribeToSessions, unsubscribe,
  type SessionRow,
} from '@/lib/realtime';
import WorkflowStatus from '@/components/WorkflowStatus';
import HumanApproval from '@/components/HumanApproval';
import { clsx } from 'clsx';

// Lazy-load MemoryGraph to avoid SSR issues with the SVG simulation
const MemoryGraph = dynamic(() => import('@/components/MemoryGraph'), {
  ssr: false,
  loading: () => (
    <div className="bg-doc-card border border-doc-border/30 rounded-xl h-96 flex items-center justify-center">
      <p className="text-doc-text/40 text-sm">Loading memory graph…</p>
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────

interface EnrichedRun extends WorkflowRun {
  state?: StateResponse;
  pending?: PendingApproval;
}

interface MemStats {
  total_nodes: number;
  total_edges: number;
  by_type: Record<string, number>;
  by_domain: Record<string, number>;
}

type Tab = 'overview' | 'pending' | 'memory' | 'history';

// ─── Dashboard page ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [runs, setRuns] = useState<EnrichedRun[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [memStats, setMemStats] = useState<MemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [threadSearch, setThreadSearch] = useState('');
  const [manualThread, setManualThread] = useState('');
  const [manualState, setManualState] = useState<StateResponse | null>(null);
  const [manualPending, setManualPending] = useState<PendingApproval | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [runsData, sessionData, statsData] = await Promise.allSettled([
        langGraph.listRuns(30),
        fetchSessions(30),
        fetchMemoryStats(),
      ]);

      if (runsData.status === 'fulfilled') {
        const enriched = runsData.value.runs;
        // Fetch status for each paused/pending run
        const withState = await Promise.all(
          enriched.map(async (run): Promise<EnrichedRun> => {
            const tid = run.thread_id || run.id;
            if (!tid || run.outcome === 'complete' || run.outcome === 'rejected') return run;
            try {
              const state = await langGraph.getStatus(tid);
              const pending = state.status === 'paused'
                ? await langGraph.getPending(tid).catch(() => undefined)
                : undefined;
              return { ...run, state, pending };
            } catch {
              return run;
            }
          })
        );
        setRuns(withState);
      }

      if (sessionData.status === 'fulfilled') setSessions(sessionData.value);
      if (statsData.status === 'fulfilled') setMemStats(statsData.value);
    } catch { /* non-fatal */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const channel = subscribeToSessions(() => loadData(true));
    const interval = setInterval(() => loadData(true), 15_000);
    return () => {
      unsubscribe(channel);
      clearInterval(interval);
    };
  }, [loadData]);

  async function lookupThread() {
    const tid = manualThread.trim();
    if (!tid) return;
    setManualLoading(true);
    setManualState(null);
    setManualPending(null);
    try {
      const state = await langGraph.getStatus(tid);
      setManualState(state);
      if (state.status === 'paused') {
        const p = await langGraph.getPending(tid).catch(() => null);
        setManualPending(p);
      }
    } catch (e) {
      setManualState({ thread_id: tid, status: 'error', domain: null, current_node: null, draft_document: null, human_gate_status: null, error: e instanceof Error ? e.message : 'Not found', complete: false });
    } finally {
      setManualLoading(false);
    }
  }

  // Derived stats
  const pendingRuns = runs.filter(r => r.state?.status === 'paused');
  const activeRuns = runs.filter(r => r.state?.status === 'running');
  const completedRuns = sessions.filter(s => s.outcome === 'complete' || s.outcome === 'approved');
  const errorRuns = sessions.filter(s => s.outcome === 'error');

  const filteredSessions = sessions.filter(s =>
    !threadSearch ||
    s.thread_id?.includes(threadSearch) ||
    s.query?.toLowerCase().includes(threadSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-doc-dark text-doc-text">

      {/* Top bar */}
      <div className="border-b border-doc-border/20 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">zPrimeDox AI HQ</h1>
          <p className="text-doc-text/40 text-xs mt-0.5">Command Center · LangGraph Engine</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingRuns.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-doc-gold/15 border border-doc-gold/30 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-doc-gold animate-pulse" />
              <span className="text-doc-gold text-xs font-semibold">
                {pendingRuns.length} awaiting approval
              </span>
            </div>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={clsx('text-doc-text/60', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4">
        {[
          { icon: <Clock size={16} className="text-doc-gold" />, label: 'Pending Approval', value: pendingRuns.length, color: 'border-doc-gold/30' },
          { icon: <Activity size={16} className="text-blue-400" />, label: 'Active Workflows', value: activeRuns.length, color: 'border-blue-400/30' },
          { icon: <CheckCircle size={16} className="text-doc-green" />, label: 'Completed', value: completedRuns.length, color: 'border-doc-green/30' },
          { icon: <Database size={16} className="text-purple-400" />, label: 'Memory Nodes', value: memStats?.total_nodes ?? '—', color: 'border-purple-400/30' },
        ].map(stat => (
          <div key={stat.label} className={clsx('bg-doc-card border rounded-xl p-4', stat.color)}>
            <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-doc-text/50 text-xs">{stat.label}</span></div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-doc-border/20">
        <div className="flex gap-0">
          {([
            { id: 'overview',  label: 'Overview' },
            { id: 'pending',   label: `Pending${pendingRuns.length > 0 ? ` (${pendingRuns.length})` : ''}` },
            { id: 'memory',    label: 'Memory Graph' },
            { id: 'history',   label: 'History' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                tab === t.id
                  ? 'border-doc-green text-doc-green'
                  : 'border-transparent text-doc-text/50 hover:text-doc-text'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-6">

        {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left col */}
            <div className="lg:col-span-2 space-y-5">

              {/* Pending approvals preview */}
              {pendingRuns.length > 0 && (
                <section>
                  <h2 className="text-doc-gold font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={13} /> Pending Approvals
                  </h2>
                  <div className="space-y-3">
                    {pendingRuns.slice(0, 2).map(run => (
                      <PendingCard
                        key={run.thread_id || run.id}
                        run={run}
                        onDecision={() => loadData(true)}
                      />
                    ))}
                    {pendingRuns.length > 2 && (
                      <button
                        onClick={() => setTab('pending')}
                        className="w-full py-2 text-doc-gold/70 text-xs hover:text-doc-gold transition-colors"
                      >
                        +{pendingRuns.length - 2} more → View all pending
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Active workflows */}
              {activeRuns.length > 0 && (
                <section>
                  <h2 className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity size={13} /> Active Workflows
                  </h2>
                  <div className="space-y-2">
                    {activeRuns.map(run => (
                      <WorkflowStatus
                        key={run.thread_id || run.id}
                        domain={run.domain}
                        currentNode={run.state?.current_node ?? null}
                        status="running"
                        threadId={run.thread_id || run.id}
                        compact
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Thread lookup */}
              <section>
                <h2 className="text-doc-text/60 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Search size={13} /> Thread Lookup
                </h2>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-white/5 border border-doc-border/30 rounded-lg px-3 py-2 text-doc-text text-sm focus:outline-none focus:border-doc-green/60"
                    placeholder="Paste thread_id…"
                    value={manualThread}
                    onChange={e => setManualThread(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && lookupThread()}
                  />
                  <button
                    onClick={lookupThread}
                    disabled={manualLoading || !manualThread.trim()}
                    className="px-4 py-2 bg-doc-green/20 text-doc-green rounded-lg text-sm hover:bg-doc-green/30 disabled:opacity-40 transition-colors"
                  >
                    {manualLoading ? '…' : 'Lookup'}
                  </button>
                </div>
                {manualState && (
                  <div className="mt-3 space-y-3">
                    <WorkflowStatus
                      domain={manualState.domain}
                      currentNode={manualState.current_node}
                      status={
                        manualState.status === 'paused' ? 'paused' :
                        manualState.complete ? 'complete' :
                        manualState.status === 'error' ? 'error' : 'running'
                      }
                      threadId={manualState.thread_id}
                    />
                    {manualPending && (
                      <HumanApproval
                        approval={manualPending}
                        onDecision={() => { setManualState(null); setManualPending(null); loadData(true); }}
                      />
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Right col — mini stats */}
            <div className="space-y-5">
              {memStats && (
                <div className="bg-doc-card border border-doc-border/30 rounded-xl p-4 space-y-3">
                  <h3 className="text-doc-text/50 text-xs font-semibold uppercase tracking-wider">
                    Memory Graph
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Total Nodes', val: memStats.total_nodes, color: 'text-doc-gold' },
                      { label: 'Total Edges', val: memStats.total_edges, color: 'text-doc-gold' },
                    ].map(s => (
                      <div key={s.label} className="bg-white/5 rounded-lg p-2.5 text-center">
                        <div className={clsx('text-xl font-bold', s.color)}>{s.val}</div>
                        <div className="text-doc-text/40 text-xs">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {Object.entries(memStats.by_type).length > 0 && (
                    <div className="space-y-1.5">
                      {Object.entries(memStats.by_type).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-doc-text/50 text-xs capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-doc-green rounded-full"
                                style={{ width: `${(count / memStats.total_nodes) * 100}%` }}
                              />
                            </div>
                            <span className="text-doc-text/60 text-xs w-6 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setTab('memory')}
                    className="w-full text-center text-doc-green/60 text-xs hover:text-doc-green transition-colors py-1"
                  >
                    View full graph →
                  </button>
                </div>
              )}

              {/* Domain breakdown */}
              {memStats && Object.keys(memStats.by_domain).length > 0 && (
                <div className="bg-doc-card border border-doc-border/30 rounded-xl p-4 space-y-3">
                  <h3 className="text-doc-text/50 text-xs font-semibold uppercase tracking-wider">By Domain</h3>
                  {Object.entries(memStats.by_domain).map(([domain, count]) => (
                    <div key={domain} className="flex items-center justify-between">
                      <span className="text-doc-text/60 text-xs capitalize">{domain}</span>
                      <span className="text-doc-green font-medium text-xs">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent errors */}
              {errorRuns.length > 0 && (
                <div className="bg-doc-card border border-red-500/20 rounded-xl p-4">
                  <h3 className="text-red-400/70 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle size={12} /> Errors ({errorRuns.length})
                  </h3>
                  {errorRuns.slice(0, 3).map(s => (
                    <div key={s.id} className="text-xs text-doc-text/40 truncate mb-1">
                      {s.thread_id?.slice(0, 8)}… · {s.query?.slice(0, 40)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PENDING ──────────────────────────────────────────────────── */}
        {tab === 'pending' && (
          <div className="max-w-2xl space-y-4">
            {loading ? (
              <LoadingState />
            ) : pendingRuns.length === 0 ? (
              <EmptyState
                icon={<CheckCircle size={40} className="text-doc-green/40" />}
                message="No pending approvals"
                sub="Workflows waiting at the human gate will appear here."
              />
            ) : (
              pendingRuns.map(run => (
                <PendingCard
                  key={run.thread_id || run.id}
                  run={run}
                  onDecision={() => loadData(true)}
                  expanded
                />
              ))
            )}
          </div>
        )}

        {/* ── MEMORY GRAPH ─────────────────────────────────────────────── */}
        {tab === 'memory' && (
          <div className="max-w-4xl">
            <MemoryGraph />
          </div>
        )}

        {/* ── HISTORY ──────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-doc-text/30" />
              <input
                className="w-full bg-white/5 border border-doc-border/30 rounded-lg pl-9 pr-3 py-2 text-doc-text text-sm focus:outline-none focus:border-doc-green/60"
                placeholder="Filter by thread or query…"
                value={threadSearch}
                onChange={e => setThreadSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredSessions.length === 0 ? (
              <EmptyState
                icon={<Database size={40} className="text-doc-text/20" />}
                message="No workflow history yet"
                sub="Completed sessions appear here automatically."
              />
            ) : (
              <div className="space-y-2">
                {filteredSessions.map(s => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function PendingCard({ run, onDecision, expanded = false }: { run: EnrichedRun; onDecision: () => void; expanded?: boolean }) {
  const [open, setOpen] = useState(expanded);
  const tid = run.thread_id || run.id;

  return (
    <div className="bg-doc-card border border-doc-gold/30 rounded-xl overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-2 h-2 rounded-full bg-doc-gold animate-pulse flex-shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <div className="text-doc-text font-medium text-sm truncate">{run.query}</div>
          <div className="text-doc-text/40 text-xs mt-0.5 font-mono">{tid?.slice(0, 12)}… · {run.domain}</div>
        </div>
        {open ? <ChevronUp size={14} className="text-doc-text/40 flex-shrink-0" /> : <ChevronDown size={14} className="text-doc-text/40 flex-shrink-0" />}
      </button>
      {open && run.pending && (
        <div className="border-t border-doc-gold/20 p-4">
          <HumanApproval
            approval={run.pending}
            onDecision={() => onDecision()}
          />
        </div>
      )}
      {open && !run.pending && (
        <div className="border-t border-doc-gold/20 px-4 py-3">
          <p className="text-doc-text/40 text-sm">Loading approval details…</p>
        </div>
      )}
    </div>
  );
}

function SessionRowComponent({ session }: { session: SessionRow }) {
  const outcomeColor: Record<string, string> = {
    complete: 'text-doc-green',
    approved: 'text-doc-green',
    rejected: 'text-red-400',
    error: 'text-red-400',
    pending: 'text-doc-gold',
  };

  return (
    <div className="bg-doc-card border border-doc-border/20 rounded-xl px-4 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-doc-text text-sm truncate">{session.query}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-doc-text/30 text-xs font-mono">{session.thread_id?.slice(0, 10)}…</span>
          {session.domain && (
            <span className="text-doc-text/40 text-xs capitalize">{session.domain}</span>
          )}
          <span className="text-doc-text/30 text-xs">
            {new Date(session.created_at).toLocaleDateString('en-CA')}
          </span>
        </div>
      </div>
      <span className={clsx('text-xs font-medium capitalize flex-shrink-0', outcomeColor[session.outcome || ''] || 'text-doc-text/40')}>
        {session.outcome || 'unknown'}
      </span>
    </div>
  );
}

// Use named export reference to avoid re-declaration lint warning
const SessionRow = SessionRowComponent;

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-doc-text/30 text-sm">Loading…</div>
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-doc-text/50 font-medium">{message}</p>
      <p className="text-doc-text/30 text-sm mt-1">{sub}</p>
    </div>
  );
}
