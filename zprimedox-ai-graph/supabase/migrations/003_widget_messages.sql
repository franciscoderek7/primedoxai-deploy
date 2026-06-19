-- zPrimeDox AI HQ — Widget Chat Logging
-- Migration: 003_widget_messages
-- Stores every empire-site chat-widget turn for human review and the
-- /api/v1/report aggregate endpoint. This is plain logging, not a learning
-- system — there is no automated retraining against this table.

CREATE TABLE IF NOT EXISTS widget_messages (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    site        text NOT NULL,
    persona     text NOT NULL,
    visitor_id  text,
    message     text NOT NULL,
    response    text NOT NULL,
    escalate    boolean DEFAULT false,
    created_at  timestamptz DEFAULT now()
);

ALTER TABLE widget_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON widget_messages USING (true) WITH CHECK (true);

CREATE INDEX idx_widget_messages_site ON widget_messages (site);
CREATE INDEX idx_widget_messages_persona ON widget_messages (persona);
CREATE INDEX idx_widget_messages_created_at ON widget_messages (created_at DESC);
CREATE INDEX idx_widget_messages_escalate ON widget_messages (escalate) WHERE escalate = true;
