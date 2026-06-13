-- zPrimeDox AI HQ — Memory Graph + Knowledge Base Schema
-- Migration: 002_memory_graph
-- Requires: pgvector extension

-- ─── Enable Extensions ──────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Sessions Table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id   text UNIQUE NOT NULL,
    session_id  text,
    user_id     text,
    domain      text CHECK (domain IN ('legal', 'cyber', 'safety', 'business')),
    query       text NOT NULL,
    urgency     text DEFAULT 'normal',
    outcome     text CHECK (outcome IN ('approved', 'rejected', 'revision', 'complete', 'error', 'pending')),
    error       text,
    created_at  timestamptz DEFAULT now(),
    completed_at timestamptz
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON sessions USING (true) WITH CHECK (true);

CREATE INDEX idx_sessions_thread_id ON sessions (thread_id);
CREATE INDEX idx_sessions_domain ON sessions (domain);
CREATE INDEX idx_sessions_created_at ON sessions (created_at DESC);

-- ─── Memory Nodes (Knowledge Graph Vertices) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS memory_nodes (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_type   text NOT NULL,   -- 'entity' | 'concept' | 'document' | 'citation'
    label       text NOT NULL,
    content     text,
    domain      text,
    embedding   vector(1536),    -- OpenAI ada-002 / Anthropic compatible
    metadata    jsonb DEFAULT '{}',
    usage_count integer DEFAULT 1,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

ALTER TABLE memory_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON memory_nodes USING (true) WITH CHECK (true);

CREATE INDEX idx_memory_nodes_type ON memory_nodes (node_type);
CREATE INDEX idx_memory_nodes_domain ON memory_nodes (domain);
CREATE INDEX idx_memory_nodes_usage ON memory_nodes (usage_count DESC);
CREATE INDEX idx_memory_nodes_embedding ON memory_nodes USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ─── Memory Edges (Knowledge Graph Relationships) ────────────────────────────

CREATE TABLE IF NOT EXISTS memory_edges (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id       uuid NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
    target_id       uuid NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
    relationship    text NOT NULL,  -- 'cited_by' | 'related_to' | 'supports' | 'contradicts'
    weight          float DEFAULT 1.0,
    session_id      uuid REFERENCES sessions(id) ON DELETE SET NULL,
    metadata        jsonb DEFAULT '{}',
    created_at      timestamptz DEFAULT now(),
    UNIQUE (source_id, target_id, relationship)
);

ALTER TABLE memory_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON memory_edges USING (true) WITH CHECK (true);

CREATE INDEX idx_memory_edges_source ON memory_edges (source_id);
CREATE INDEX idx_memory_edges_target ON memory_edges (target_id);
CREATE INDEX idx_memory_edges_relationship ON memory_edges (relationship);

-- ─── Case Documents ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS case_documents (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      uuid REFERENCES sessions(id) ON DELETE CASCADE,
    thread_id       text NOT NULL,
    document_type   text,          -- 'motion' | 'memo' | 'threat_report' | 'incident_report' | 'strategy'
    domain          text,
    content         text NOT NULL,
    embedding       vector(1536),
    compliance_score float,
    approved_by     text,
    approved_at     timestamptz,
    metadata        jsonb DEFAULT '{}',
    created_at      timestamptz DEFAULT now()
);

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON case_documents USING (true) WITH CHECK (true);

CREATE INDEX idx_case_docs_session ON case_documents (session_id);
CREATE INDEX idx_case_docs_thread ON case_documents (thread_id);
CREATE INDEX idx_case_docs_domain ON case_documents (domain);
CREATE INDEX idx_case_docs_embedding ON case_documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ─── Self-Review / Lessons Learned ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lessons_learned (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  uuid REFERENCES sessions(id) ON DELETE SET NULL,
    domain      text,
    lesson      text NOT NULL,
    applied     boolean DEFAULT false,
    created_at  timestamptz DEFAULT now()
);

ALTER TABLE lessons_learned ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON lessons_learned USING (true) WITH CHECK (true);

CREATE INDEX idx_lessons_domain ON lessons_learned (domain);
CREATE INDEX idx_lessons_applied ON lessons_learned (applied);

-- ─── Helper: Update timestamps ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_memory_nodes_updated_at
    BEFORE UPDATE ON memory_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Helper: Semantic similarity search ──────────────────────────────────────

CREATE OR REPLACE FUNCTION search_memory(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.75,
    match_count     int DEFAULT 10,
    filter_domain   text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    label text,
    content text,
    node_type text,
    similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.id,
        n.label,
        n.content,
        n.node_type,
        1 - (n.embedding <=> query_embedding) AS similarity
    FROM memory_nodes n
    WHERE
        (filter_domain IS NULL OR n.domain = filter_domain)
        AND 1 - (n.embedding <=> query_embedding) > match_threshold
    ORDER BY n.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION search_case_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.75,
    match_count     int DEFAULT 5,
    filter_domain   text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    thread_id text,
    document_type text,
    content text,
    similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.thread_id,
        d.document_type,
        d.content,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM case_documents d
    WHERE
        (filter_domain IS NULL OR d.domain = filter_domain)
        AND d.embedding IS NOT NULL
        AND 1 - (d.embedding <=> query_embedding) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
