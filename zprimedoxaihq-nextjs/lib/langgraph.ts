/**
 * LangGraph API client — calls the FastAPI backend at NEXT_PUBLIC_LANGGRAPH_API_URL
 */

const API_BASE =
  (typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_LANGGRAPH_API_URL
    : undefined) ||
  process.env.NEXT_PUBLIC_LANGGRAPH_API_URL ||
  'http://localhost:8000/api/v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkflowStatus = 'paused' | 'complete' | 'error' | 'running';

export interface RunRequest {
  query: string;
  domain_hint?: string;
  urgency?: string;
  user_id?: string;
}

export interface RunResponse {
  thread_id: string;
  session_id: string;
  status: WorkflowStatus;
  current_node: string | null;
  message: string;
}

export interface StateResponse {
  thread_id: string;
  status: WorkflowStatus;
  domain: string | null;
  current_node: string | null;
  draft_document: string | null;
  human_gate_status: string | null;
  error: string | null;
  complete: boolean;
}

export interface PendingApproval {
  thread_id: string;
  status: string;
  domain: string | null;
  document_type: string | null;
  draft_document: string | null;
  compliance_score: number | null;
  red_flags: string[];
  review_memo: string | null;
  interrupt_data: Record<string, unknown> | null;
  paused_at: string;
}

export interface ResumeInput {
  action: 'approve' | 'reject' | 'revision';
  feedback?: string;
  edited_document?: string;
  approved_by?: string;
}

export interface ResumeResponse {
  thread_id: string;
  action: string;
  status: WorkflowStatus;
  message: string;
  final_document: string | null;
}

export interface WorkflowRun {
  id: string;
  thread_id?: string;
  domain: string | null;
  query: string;
  outcome: string | null;
  created_at: string;
}

// ─── Fetch wrapper ─────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// ─── API surface ──────────────────────────────────────────────────────────

export const langGraph = {
  /** Start a new workflow. Returns thread_id immediately. */
  startRun: (req: RunRequest) =>
    apiFetch<RunResponse>('/run', { method: 'POST', body: JSON.stringify(req) }),

  /** Poll current state of a workflow. */
  getStatus: (threadId: string) =>
    apiFetch<StateResponse>(`/run/${threadId}`),

  /** Get document and metadata waiting at the human gate. */
  getPending: (threadId: string) =>
    apiFetch<PendingApproval>(`/pending/${threadId}`),

  /** Resume a paused workflow with human decision. */
  resume: (threadId: string, input: ResumeInput) =>
    apiFetch<ResumeResponse>(`/run/${threadId}/resume`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** List recent workflow sessions from Supabase. */
  listRuns: (limit = 30) =>
    apiFetch<{ runs: WorkflowRun[] }>(`/runs?limit=${limit}`),

  /** Health check. */
  health: () =>
    apiFetch<{ status: string; version: string }>('/health'.replace('/api/v1', '')),
};

// ─── Polling helper ───────────────────────────────────────────────────────

export function pollUntilDone(
  threadId: string,
  onUpdate: (state: StateResponse) => void,
  intervalMs = 2500
): () => void {
  let cancelled = false;

  async function tick() {
    if (cancelled) return;
    try {
      const state = await langGraph.getStatus(threadId);
      onUpdate(state);
      if (!state.complete && state.status !== 'paused' && state.status !== 'error') {
        setTimeout(tick, intervalMs);
      }
    } catch {
      if (!cancelled) setTimeout(tick, intervalMs * 2);
    }
  }

  tick();
  return () => { cancelled = true; };
}
