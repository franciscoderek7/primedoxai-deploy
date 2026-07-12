/**
 * VIGILAX — Human Review Queue
 * Prioritized queue: AI flags → Human reviews → Decision → Legal → Authority
 * Audit trail: every review logged with who, what, when, decision.
 * Rule: System never auto-accuses. All high-risk findings require human sign-off.
 */

'use strict';

const crypto = require('crypto');

// ── In-memory queue (swap for PostgreSQL/Redis in production) ────────────────

const queue = new Map(); // id → item
const auditLog = [];
const MAX_AUDIT = 2000;

// ── Queue item factory ────────────────────────────────────────────────────────

function createQueueItem(scanResult, submittedBy = 'VIGILAX-AUTO') {
  const id = `RVW-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const item = {
    id,
    status: 'PENDING',         // PENDING | IN_REVIEW | DECIDED | ESCALATED | CLOSED
    priority: calcPriority(scanResult),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitted_by: submittedBy,
    engine: scanResult.engine,
    verdict: scanResult.verdict,
    risk_score: scanResult.risk_score,
    severity: scanResult.severity,
    findings_count: (scanResult.findings || []).length,
    critical_findings: (scanResult.findings || []).filter(f => f.severity === 'CRITICAL').length,
    scan_data: scanResult,
    review_history: [],
    escalation_path: ['AI', 'Human', 'Legal', 'Authority'],
    current_escalation_level: 0,
    human_review_required: scanResult.risk_score >= 40,
    // CRITICAL RULE: Never auto-accuse. All outputs labeled "Review required."
    auto_accusation_blocked: true,
    review_note: 'REVIEW REQUIRED: Automated analysis only. No action may be taken without human investigator sign-off.',
  };

  queue.set(id, item);
  logAudit({ action: 'QUEUE_ADD', item_id: id, actor: submittedBy, detail: `Engine: ${scanResult.engine}, Score: ${scanResult.risk_score}` });
  return item;
}

function calcPriority(scanResult) {
  // Priority score (higher = more urgent)
  const riskWeight = scanResult.risk_score || 0;
  const criticalBonus = ((scanResult.findings || []).filter(f => f.severity === 'CRITICAL').length) * 10;
  const verdictBonus = scanResult.verdict === 'FRAUDULENT' ? 20 : scanResult.verdict === 'HIGH_RISK' ? 15 : scanResult.verdict === 'SUSPICIOUS' ? 10 : 0;
  return Math.min(100, riskWeight + criticalBonus + verdictBonus);
}

// ── Queue operations ──────────────────────────────────────────────────────────

function getQueue({ status, min_risk, engine, limit = 50 } = {}) {
  let items = Array.from(queue.values());
  if (status)   items = items.filter(i => i.status === status);
  if (min_risk) items = items.filter(i => i.risk_score >= parseInt(min_risk));
  if (engine)   items = items.filter(i => i.engine === engine);
  return items
    .sort((a, b) => b.priority - a.priority || new Date(a.created_at) - new Date(b.created_at))
    .slice(0, limit)
    .map(i => ({
      id: i.id, status: i.status, priority: i.priority, created_at: i.created_at,
      engine: i.engine, verdict: i.verdict, risk_score: i.risk_score, severity: i.severity,
      findings_count: i.findings_count, critical_findings: i.critical_findings,
      human_review_required: i.human_review_required, review_note: i.review_note,
      current_escalation_level: i.current_escalation_level,
      escalation_label: i.escalation_path[i.current_escalation_level] || 'CLOSED',
    }));
}

function getQueueItem(id) {
  return queue.get(id) || null;
}

/**
 * submitReview(id, review)
 * review: { reviewer_id, reviewer_name, decision, notes, action_taken }
 * decision: 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'NEEDS_MORE_INFO' | 'ESCALATE' | 'CLOSE'
 */
function submitReview(id, review) {
  const item = queue.get(id);
  if (!item) throw new Error(`Queue item ${id} not found`);

  const reviewEntry = {
    review_id: crypto.randomBytes(8).toString('hex'),
    reviewer_id: review.reviewer_id || 'unknown',
    reviewer_name: review.reviewer_name || 'Unknown Investigator',
    decision: review.decision,
    notes: review.notes || null,
    action_taken: review.action_taken || null,
    timestamp: new Date().toISOString(),
  };

  item.review_history.push(reviewEntry);
  item.updated_at = reviewEntry.timestamp;

  switch (review.decision) {
    case 'CONFIRMED_FRAUD':
      item.status = 'DECIDED';
      item.final_decision = 'CONFIRMED_FRAUD';
      item.requires_legal_referral = item.risk_score >= 70;
      break;
    case 'FALSE_POSITIVE':
      item.status = 'CLOSED';
      item.final_decision = 'FALSE_POSITIVE';
      break;
    case 'NEEDS_MORE_INFO':
      item.status = 'IN_REVIEW';
      break;
    case 'ESCALATE':
      item.current_escalation_level = Math.min(item.current_escalation_level + 1, item.escalation_path.length - 1);
      item.status = 'ESCALATED';
      break;
    case 'CLOSE':
      item.status = 'CLOSED';
      item.final_decision = 'CLOSED_BY_REVIEWER';
      break;
  }

  logAudit({
    action: 'REVIEW_SUBMITTED',
    item_id: id,
    actor: review.reviewer_name,
    detail: `Decision: ${review.decision}. Notes: ${review.notes || 'none'}`,
  });

  queue.set(id, item);
  return item;
}

// ── Escalation ────────────────────────────────────────────────────────────────

function escalateItem(id, reason, escalatedBy) {
  const item = queue.get(id);
  if (!item) throw new Error(`Queue item ${id} not found`);
  if (item.current_escalation_level >= item.escalation_path.length - 1) {
    throw new Error(`Item ${id} already at maximum escalation level`);
  }

  item.current_escalation_level++;
  item.status = 'ESCALATED';
  item.updated_at = new Date().toISOString();
  logAudit({ action: 'ESCALATED', item_id: id, actor: escalatedBy, detail: reason });
  queue.set(id, item);
  return item;
}

// ── Audit log ─────────────────────────────────────────────────────────────────

function logAudit(entry) {
  auditLog.unshift({ ...entry, timestamp: new Date().toISOString() });
  if (auditLog.length > MAX_AUDIT) auditLog.pop();
}

function getAuditLog({ item_id, actor, limit = 100, since } = {}) {
  let log = [...auditLog];
  if (item_id) log = log.filter(e => e.item_id === item_id);
  if (actor)   log = log.filter(e => e.actor?.includes(actor));
  if (since)   log = log.filter(e => new Date(e.timestamp) > new Date(since));
  return log.slice(0, limit);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function getQueueStats() {
  const items = Array.from(queue.values());
  const byStatus = {};
  const byEngine = {};
  items.forEach(i => {
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
    byEngine[i.engine] = (byEngine[i.engine] || 0) + 1;
  });
  return {
    total: items.length,
    pending: items.filter(i => i.status === 'PENDING').length,
    in_review: items.filter(i => i.status === 'IN_REVIEW').length,
    decided: items.filter(i => i.status === 'DECIDED').length,
    escalated: items.filter(i => i.status === 'ESCALATED').length,
    closed: items.filter(i => i.status === 'CLOSED').length,
    high_priority: items.filter(i => i.priority >= 70).length,
    confirmed_fraud: items.filter(i => i.final_decision === 'CONFIRMED_FRAUD').length,
    false_positives: items.filter(i => i.final_decision === 'FALSE_POSITIVE').length,
    by_status: byStatus,
    by_engine: byEngine,
    avg_risk_score: items.length ? Math.round(items.reduce((s, i) => s + i.risk_score, 0) / items.length) : 0,
  };
}

// ── Express route registration ────────────────────────────────────────────────

function registerRoutes(app, requireApiKey, limiter) {
  // GET review queue
  app.get('/api/vigilax/review-queue', limiter, requireApiKey, (req, res) => {
    const { status, min_risk, engine, limit } = req.query;
    res.json({
      queue: getQueue({ status, min_risk, engine, limit: parseInt(limit) || 50 }),
      stats: getQueueStats(),
    });
  });

  // GET single queue item (full detail)
  app.get('/api/vigilax/review-queue/:id', limiter, requireApiKey, (req, res) => {
    const item = getQueueItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Queue item not found' });
    res.json(item);
  });

  // POST submit a review decision
  app.post('/api/vigilax/review-queue/:id/review', limiter, requireApiKey, (req, res) => {
    const { reviewer_id, reviewer_name, decision, notes, action_taken } = req.body || {};
    const validDecisions = ['CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'NEEDS_MORE_INFO', 'ESCALATE', 'CLOSE'];
    if (!decision || !validDecisions.includes(decision)) {
      return res.status(400).json({ error: `decision must be one of: ${validDecisions.join(', ')}` });
    }
    if (!reviewer_name) return res.status(400).json({ error: 'reviewer_name required' });
    try {
      const updated = submitReview(req.params.id, { reviewer_id, reviewer_name, decision, notes, action_taken });
      res.json({ success: true, item: updated });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // POST escalate
  app.post('/api/vigilax/review-queue/:id/escalate', limiter, requireApiKey, (req, res) => {
    const { reason, escalated_by } = req.body || {};
    try {
      const updated = escalateItem(req.params.id, reason || 'Manual escalation', escalated_by || 'unknown');
      res.json({ success: true, item: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // GET audit log
  app.get('/api/vigilax/audit-log', limiter, requireApiKey, (req, res) => {
    const { item_id, actor, limit, since } = req.query;
    res.json({ log: getAuditLog({ item_id, actor, limit: parseInt(limit) || 100, since }) });
  });

  // GET queue stats
  app.get('/api/vigilax/queue-stats', limiter, requireApiKey, (req, res) => {
    res.json(getQueueStats());
  });
}

module.exports = { createQueueItem, getQueue, getQueueItem, submitReview, escalateItem, getAuditLog, getQueueStats, registerRoutes };
