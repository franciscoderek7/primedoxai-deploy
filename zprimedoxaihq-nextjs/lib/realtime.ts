/**
 * Supabase real-time subscriptions for session updates.
 * Falls back gracefully if Supabase is not configured.
 */
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type SessionRow = {
  id: string;
  thread_id: string;
  session_id: string | null;
  domain: string | null;
  query: string;
  urgency: string | null;
  outcome: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
};

export type MemoryNodeRow = {
  id: string;
  node_type: string;
  label: string;
  content: string | null;
  domain: string | null;
  usage_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MemoryEdgeRow = {
  id: string;
  source_id: string;
  target_id: string;
  relationship: string;
  weight: number;
};

// ─── Session subscriptions ────────────────────────────────────────────────

export function subscribeToSessions(
  callback: (payload: { eventType: string; new: SessionRow; old: Partial<SessionRow> }) => void
): RealtimeChannel {
  return supabase
    .channel('rt-sessions-all')
    .on(
      'postgres_changes' as Parameters<ReturnType<typeof supabase.channel>['on']>[0],
      { event: '*', schema: 'public', table: 'sessions' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => callback(payload)
    )
    .subscribe();
}

export function subscribeToSession(
  threadId: string,
  callback: (row: SessionRow) => void
): RealtimeChannel {
  return supabase
    .channel(`rt-session-${threadId}`)
    .on(
      'postgres_changes' as Parameters<ReturnType<typeof supabase.channel>['on']>[0],
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `thread_id=eq.${threadId}`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => callback(payload.new as SessionRow)
    )
    .subscribe();
}

export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

// ─── Data fetching helpers ────────────────────────────────────────────────

export async function fetchSessions(limit = 30): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as SessionRow[]) || [];
}

export async function fetchMemoryNodes(limit = 200): Promise<MemoryNodeRow[]> {
  const { data, error } = await supabase
    .from('memory_nodes')
    .select('id, node_type, label, content, domain, usage_count, metadata, created_at')
    .order('usage_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as MemoryNodeRow[]) || [];
}

export async function fetchMemoryEdges(nodeIds: string[]): Promise<MemoryEdgeRow[]> {
  if (nodeIds.length === 0) return [];
  const { data, error } = await supabase
    .from('memory_edges')
    .select('id, source_id, target_id, relationship, weight')
    .in('source_id', nodeIds);
  if (error) throw error;
  return (data as MemoryEdgeRow[]) || [];
}

export async function fetchMemoryStats(): Promise<{
  total_nodes: number;
  total_edges: number;
  by_type: Record<string, number>;
  by_domain: Record<string, number>;
}> {
  const [nodesRes, edgesRes] = await Promise.all([
    supabase.from('memory_nodes').select('node_type, domain', { count: 'exact' }),
    supabase.from('memory_edges').select('id', { count: 'exact' }),
  ]);

  const nodes = (nodesRes.data || []) as { node_type: string; domain: string | null }[];
  const byType: Record<string, number> = {};
  const byDomain: Record<string, number> = {};

  for (const n of nodes) {
    byType[n.node_type] = (byType[n.node_type] || 0) + 1;
    if (n.domain) byDomain[n.domain] = (byDomain[n.domain] || 0) + 1;
  }

  return {
    total_nodes: nodesRes.count || 0,
    total_edges: edgesRes.count || 0,
    by_type: byType,
    by_domain: byDomain,
  };
}

// ─── Polling fallback ─────────────────────────────────────────────────────

export function poll(fn: () => Promise<void>, intervalMs = 5000): () => void {
  let id: ReturnType<typeof setInterval> | null = null;
  fn().then(() => {
    id = setInterval(() => fn().catch(console.error), intervalMs);
  });
  return () => { if (id !== null) clearInterval(id); };
}
