/**
 * PrimeDox AI — No-Database Realtime Compatibility Layer
 *
 * Supabase has been removed from the production path.
 *
 * IMPORTANT:
 * This module intentionally preserves the function/type names expected
 * by the existing dashboard and MemoryGraph components.
 *
 * It provides safe empty/local fallbacks instead of requiring:
 * - Supabase
 * - authentication
 * - a database
 * - paid realtime infrastructure
 */

export type RealtimeChannel = {
  unsubscribe: () => void;
};

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

const EMPTY_CHANNEL: RealtimeChannel = {
  unsubscribe: () => {},
};

/**
 * No-database subscription fallback.
 *
 * The dashboard still refreshes itself on a timer, so the absence of
 * realtime infrastructure does not prevent the UI from functioning.
 */
export function subscribeToSessions(
  _callback: (
    payload: {
      eventType: string;
      new: SessionRow;
      old: Partial<SessionRow>;
    }
  ) => void
): RealtimeChannel {
  return EMPTY_CHANNEL;
}

export function subscribeToSession(
  _threadId: string,
  _callback: (row: SessionRow) => void
): RealtimeChannel {
  return EMPTY_CHANNEL;
}

export function unsubscribe(channel: RealtimeChannel): void {
  channel.unsubscribe();
}

/**
 * No database means there are currently no persisted sessions.
 */
export async function fetchSessions(
  _limit = 30
): Promise<SessionRow[]> {
  return [];
}

/**
 * No database means there are currently no persisted memory nodes.
 */
export async function fetchMemoryNodes(
  _limit = 200
): Promise<MemoryNodeRow[]> {
  return [];
}

/**
 * No database means there are currently no persisted memory edges.
 */
export async function fetchMemoryEdges(
  _nodeIds: string[]
): Promise<MemoryEdgeRow[]> {
  return [];
}

/**
 * Dashboard-compatible memory statistics.
 */
export async function fetchMemoryStats(): Promise<{
  total_nodes: number;
  total_edges: number;
  by_type: Record<string, number>;
  by_domain: Record<string, number>;
}> {
  return {
    total_nodes: 0,
    total_edges: 0,
    by_type: {},
    by_domain: {},
  };
}

/**
 * Generic graph fallback for future consumers.
 */
export async function getMemoryGraph(): Promise<{
  nodes: MemoryNodeRow[];
  edges: MemoryEdgeRow[];
}> {
  return {
    nodes: [],
    edges: [],
  };
}

/**
 * Generic realtime statistics fallback for future consumers.
 */
export async function getRealtimeStats(): Promise<{
  memoryNodes: number;
  memoryEdges: number;
  workflowSessions: number;
}> {
  return {
    memoryNodes: 0,
    memoryEdges: 0,
    workflowSessions: 0,
  };
}

/**
 * Generic workflow-session compatibility helper.
 */
export async function getRecentWorkflowSessions(
  _limit = 20
): Promise<SessionRow[]> {
  return [];
}

/**
 * Generic polling helper.
 *
 * This remains database-independent.
 */
export function poll(
  fn: () => Promise<void>,
  intervalMs = 5000
): () => void {
  let stopped = false;
  let id: ReturnType<typeof setInterval> | null = null;

  const run = async () => {
    try {
      await fn();
    } catch (error) {
      console.error(error);
    }

    if (!stopped) {
      id = setInterval(() => {
        fn().catch(console.error);
      }, intervalMs);
    }
  };

  void run();

  return () => {
    stopped = true;
    if (id !== null) {
      clearInterval(id);
      id = null;
    }
  };
}
