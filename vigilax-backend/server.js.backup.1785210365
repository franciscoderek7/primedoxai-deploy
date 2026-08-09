/**
 * VIGILAX Sentinel Backend v1.0
 * Bad Actor Detection for Marketing, Advertising, Analytics & Government Oversight
 * Francisco Holdings Inc.
 */

'use strict';

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const http      = require('http');
const WebSocket = require('ws');

const clickFraud      = require('./engines/click-fraud');
const reviewFraud     = require('./engines/review-fraud');
const influencerFraud = require('./engines/influencer-fraud');
const adFraud         = require('./engines/ad-fraud');
const cannabisMonitor = require('./engines/cannabis-monitor');
const reviewQueue     = require('./review-queue');
const govFraud      = require('./engines/gov-fraud');
const alerts        = require('./alerts');
const evidence      = require('./evidence');

// ── Load industry profiles ────────────────────────────────────────────────────
let industryProfiles;
try {
  industryProfiles = require('./industry-profiles.json');
} catch {
  industryProfiles = { industries: [] };
  console.warn('[vigilax] industry-profiles.json not loaded');
}

// ── Auth ─────────────────────────────────────────────────────────────────────

const API_KEYS = new Set(
  (process.env.VIGILAX_API_KEYS || process.env.ADMIN_SECRET || '')
    .split(',').map(k => k.trim()).filter(Boolean)
);

function requireApiKey(req, res, next) {
  const key = req.headers['x-vigilax-key'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!key || (!API_KEYS.has(key) && key !== process.env.ADMIN_SECRET)) {
    return res.status(401).json({ error: 'Invalid or missing API key', hint: 'Set X-Vigilax-Key header' });
  }
  next();
}

// ── Express setup ─────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// WebSocket server (shares same HTTP port)
const wss = new WebSocket.Server({ server, path: '/ws/alerts' });
alerts.attachWebSocket(wss);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'https://vigilax.com,https://primedoxaihq.com,https://franciscoholdingsinc.com,http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Vigilax-Key'],
}));
app.use(express.json({ limit: '2mb' }));

const generalLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
const scanLimiter    = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });

// ── Helper: run scan + send alert ────────────────────────────────────────────

async function runAndAlert(scanFn, data, config, res) {
  try {
    const result = typeof scanFn === 'function'
      ? await Promise.resolve(scanFn(data, config))
      : scanFn;

    // Auto-alert for SUSPICIOUS and above
    if (['FRAUDULENT', 'SUSPICIOUS', 'HIGH_RISK'].includes(result.verdict)) {
      await alerts.sendAlert({
        engine: result.engine,
        verdict: result.verdict,
        risk_score: result.risk_score,
        severity: result.severity,
        findings_count: (result.findings || []).length,
        target: data.campaign_id || data.business_id || data.profile?.username || data.domain,
        recommended_action: result.recommended_action,
        description: (result.findings || [])[0]?.description || null,
      }).catch(err => console.warn('[vigilax] Alert failed:', err.message));
    }

    res.json(result);
  } catch (err) {
    console.error('[vigilax]', err);
    res.status(500).json({ error: 'Scan engine error', message: err.message });
  }
}

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VIGILAX Sentinel',
    version: '1.0.0',
    engines: ['click_fraud', 'review_fraud', 'influencer_fraud', 'ad_fraud', 'gov_fraud'],
    industry_profiles: industryProfiles.industries?.length || 0,
    uptime: Math.floor(process.uptime()),
    ws_clients: wss.clients.size,
    alert_email: process.env.ALERT_EMAIL || 'franciscoderek7@gmail.com',
  });
});

// ── Industry Profiles ─────────────────────────────────────────────────────────

app.get('/api/industries', (req, res) => {
  const profiles = industryProfiles.industries || [];
  const q = req.query.search?.toLowerCase();
  const filtered = q ? profiles.filter(p => p.name.toLowerCase().includes(q) || p.group.toLowerCase().includes(q)) : profiles;
  res.json({ count: filtered.length, industries: filtered.map(p => ({
    id: p.id, group: p.group, name: p.name, fraud_risk_level: p.fraud_risk_level,
    common_fraud_patterns: p.common_fraud_patterns,
  }))});
});

app.get('/api/industries/:id', (req, res) => {
  const profile = (industryProfiles.industries || []).find(p => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Industry profile not found' });
  res.json(profile);
});

// ── Click Fraud Engine ────────────────────────────────────────────────────────

/**
 * POST /api/scan/click-fraud
 * Body: { events: [...], impressions, campaign_id, industry }
 */
app.post('/api/scan/click-fraud', scanLimiter, requireApiKey, (req, res) => {
  const { events, impressions, campaign_id, industry } = req.body || {};
  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ error: 'events[] array required' });
  }
  const config = {};
  if (industry) {
    const profile = (industryProfiles.industries || []).find(p => p.id === industry);
    if (profile?.thresholds) Object.assign(config, profile.thresholds);
  }
  runAndAlert(clickFraud.analyzeClicks, { events, impressions, campaign_id }, config, res);
});

// ── Review Fraud Engine ───────────────────────────────────────────────────────

/**
 * POST /api/scan/review-fraud
 * Body: { reviews: [...], platform, business_id }
 */
app.post('/api/scan/review-fraud', scanLimiter, requireApiKey, (req, res) => {
  const { reviews, platform, business_id } = req.body || {};
  if (!reviews || !Array.isArray(reviews)) {
    return res.status(400).json({ error: 'reviews[] array required' });
  }
  runAndAlert(reviewFraud.analyzeReviews, { reviews, platform, business_id }, {}, res);
});

// ── Influencer Fraud Engine ───────────────────────────────────────────────────

/**
 * POST /api/scan/influencer-fraud
 * Body: { profile: {...}, growth_history, recent_comments, audience_demographics, target_audience }
 */
app.post('/api/scan/influencer-fraud', scanLimiter, requireApiKey, (req, res) => {
  const { profile, growth_history, recent_comments, audience_demographics, target_audience } = req.body || {};
  if (!profile?.followers) {
    return res.status(400).json({ error: 'profile.followers required' });
  }
  runAndAlert(influencerFraud.analyzeInfluencer, { profile, growth_history, recent_comments, audience_demographics, target_audience }, {}, res);
});

// ── Ad Fraud Engine ───────────────────────────────────────────────────────────

/**
 * POST /api/scan/ad-fraud
 * Body: { campaign_id, domains, pixels, placements, traffic_sample }
 */
app.post('/api/scan/ad-fraud', scanLimiter, requireApiKey, async (req, res) => {
  const data = req.body || {};
  if (!data.domains && !data.pixels && !data.placements && !data.traffic_sample) {
    return res.status(400).json({ error: 'At least one of: domains, pixels, placements, traffic_sample required' });
  }
  try {
    const result = await adFraud.analyzeAds(data, { verify_domains: process.env.VERIFY_DOMAINS === 'true' });
    if (['FRAUDULENT', 'SUSPICIOUS'].includes(result.verdict)) {
      await alerts.sendAlert({ ...result, target: data.campaign_id }).catch(() => {});
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Ad fraud scan failed', message: err.message });
  }
});

// ── Government Fraud Engine ───────────────────────────────────────────────────

/**
 * POST /api/scan/gov-fraud
 * Body: { tenders, vendors, contracts, transactions, entities_to_verify, public_records }
 */
app.post('/api/scan/gov-fraud', scanLimiter, requireApiKey, (req, res) => {
  const data = req.body || {};
  if (!data.tenders && !data.transactions && !data.vendors) {
    return res.status(400).json({ error: 'At least one of: tenders, transactions, vendors required' });
  }
  runAndAlert(govFraud.analyzeGovernmentData, data, {}, res);
});

// ── Multi-engine scan ─────────────────────────────────────────────────────────

/**
 * POST /api/scan/full
 * Run all applicable engines in parallel and return combined report.
 * Body: { click_fraud?: {...}, review_fraud?: {...}, influencer_fraud?: {...}, ad_fraud?: {...} }
 */
app.post('/api/scan/full', scanLimiter, requireApiKey, async (req, res) => {
  const body = req.body || {};
  const tasks = {};

  if (body.click_fraud?.events)        tasks.click_fraud    = clickFraud.analyzeClicks(body.click_fraud, {});
  if (body.review_fraud?.reviews)      tasks.review_fraud   = reviewFraud.analyzeReviews(body.review_fraud, {});
  if (body.influencer_fraud?.profile)  tasks.influencer_fraud = influencerFraud.analyzeInfluencer(body.influencer_fraud, {});
  if (body.ad_fraud)                   tasks.ad_fraud       = adFraud.analyzeAds(body.ad_fraud, {});
  if (body.gov_fraud)                  tasks.gov_fraud      = govFraud.analyzeGovernmentData(body.gov_fraud, {});

  if (Object.keys(tasks).length === 0) {
    return res.status(400).json({ error: 'No valid scan targets provided' });
  }

  try {
    const results = {};
    await Promise.all(
      Object.entries(tasks).map(async ([key, promise]) => {
        results[key] = await Promise.resolve(promise);
      })
    );

    const engines = Object.values(results);
    const maxScore = Math.max(...engines.map(e => e.risk_score || 0));
    const totalFindings = engines.reduce((s, e) => s + (e.findings?.length || 0), 0);
    const verdicts = engines.map(e => e.verdict);
    const worstVerdict = verdicts.includes('FRAUDULENT') ? 'FRAUDULENT'
      : verdicts.includes('HIGH_RISK') ? 'HIGH_RISK'
      : verdicts.includes('SUSPICIOUS') ? 'SUSPICIOUS'
      : 'CLEAN';

    if (['FRAUDULENT', 'HIGH_RISK', 'SUSPICIOUS'].includes(worstVerdict)) {
      await alerts.sendAlert({
        engine: 'full_scan',
        verdict: worstVerdict,
        risk_score: maxScore,
        severity: maxScore >= 70 ? 'CRITICAL' : maxScore >= 40 ? 'HIGH' : 'MEDIUM',
        findings_count: totalFindings,
        description: `Multi-engine scan: ${Object.keys(results).join(', ')}`,
        recommended_action: 'Review individual engine results and generate evidence package',
      }).catch(() => {});
    }

    res.json({
      combined_verdict: worstVerdict,
      combined_risk_score: maxScore,
      engines_run: Object.keys(results),
      total_findings: totalFindings,
      results,
      analyzed_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Full scan failed', message: err.message });
  }
});

// ── Unified Risk Scoring API (Kimi frontend integration) ──────────────────────

/**
 * POST /api/vigilax/scan
 * Universal entry point. Routes to correct engine(s) based on entity_type.
 * Body: { entity_type, entity_id, industry, data_sources: { click?, review?, influencer?, ad?, gov?, cannabis? } }
 * Rule: NEVER auto-accuses. Returns review_required when risk_score ≥ 75.
 */
app.post('/api/vigilax/scan', scanLimiter, requireApiKey, async (req, res) => {
  const { entity_type, entity_id, industry, data_sources = {} } = req.body || {};
  if (!entity_type || !data_sources) {
    return res.status(400).json({ error: 'entity_type and data_sources required' });
  }

  const results = {};
  const errors  = {};

  try {
    const tasks = [];
    if (data_sources.click)      tasks.push(['click_fraud',    () => clickFraud.analyzeClicks(data_sources.click, {})]);
    if (data_sources.review)     tasks.push(['review_fraud',   () => reviewFraud.analyzeReviews(data_sources.review, {})]);
    if (data_sources.influencer) tasks.push(['influencer_fraud', () => influencerFraud.analyzeInfluencer(data_sources.influencer, {})]);
    if (data_sources.ad)         tasks.push(['ad_fraud',        () => adFraud.analyzeAds(data_sources.ad, {})]);
    if (data_sources.gov)        tasks.push(['gov_fraud',       () => govFraud.analyzeGovernmentData(data_sources.gov, {})]);
    if (data_sources.cannabis)   tasks.push(['cannabis_monitor', () => cannabisMonitor.monitorPublicSignals(data_sources.cannabis, {})]);

    await Promise.all(tasks.map(async ([key, fn]) => {
      try { results[key] = await Promise.resolve(fn()); }
      catch (err) { errors[key] = err.message; }
    }));

    const allResults = Object.values(results);
    const maxScore   = allResults.length ? Math.max(...allResults.map(r => r.risk_score || 0)) : 0;
    const confidence = Math.min(1.0, allResults.length * 0.2 + 0.2);
    const allSignals = allResults.flatMap(r => (r.findings || []).map(f => ({ engine: r.engine, ...f })));
    const humanRequired = maxScore >= 75;

    const combinedVerdict = maxScore >= 70 ? 'FRAUDULENT'
      : maxScore >= 40 ? 'SUSPICIOUS'
      : maxScore >= 15 ? 'MONITOR'
      : 'CLEAN';

    // Auto-queue for human review when threshold met
    let queueItem = null;
    if (humanRequired && allResults.length > 0) {
      const topResult = allResults.sort((a, b) => b.risk_score - a.risk_score)[0];
      queueItem = reviewQueue.createQueueItem({ ...topResult, entity_id, entity_type, industry }, 'VIGILAX-AUTO');
    }

    // Alert if suspicious+
    if (maxScore >= 40) {
      await alerts.sendAlert({
        engine: 'vigilax_scan',
        verdict: combinedVerdict,
        risk_score: maxScore,
        severity: maxScore >= 70 ? 'CRITICAL' : 'HIGH',
        findings_count: allSignals.length,
        target: entity_id || entity_type,
        description: `${Object.keys(results).join(', ')} — ${allSignals.length} signal(s)`,
        recommended_action: humanRequired ? 'REVIEW REQUIRED — Human investigator must verify before any action.' : 'Monitor',
      }).catch(() => {});
    }

    res.json({
      entity_type,
      entity_id: entity_id || null,
      industry: industry || null,
      risk_score: maxScore,
      confidence: parseFloat(confidence.toFixed(2)),
      verdict: combinedVerdict,
      severity: maxScore >= 70 ? 'CRITICAL' : maxScore >= 40 ? 'HIGH' : maxScore >= 15 ? 'MEDIUM' : 'LOW',
      signals: allSignals.slice(0, 20),
      engines_run: Object.keys(results),
      human_review_required: humanRequired,
      review_queue_id: queueItem?.id || null,
      // NEVER auto-accuse — always require human review
      review_note: humanRequired
        ? 'REVIEW REQUIRED: Risk score ≥ 75. No action may be taken without human investigator sign-off. Evidence package generation available.'
        : maxScore >= 15
        ? 'MONITOR: Score elevated. Continue monitoring. No immediate action required.'
        : 'CLEAN: No significant fraud signals detected.',
      engine_results: results,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      analyzed_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Scan failed', message: err.message });
  }
});

// ── Cannabis Monitor ──────────────────────────────────────────────────────────

/**
 * POST /api/vigilax/cannabis-monitor
 * PUBLIC signals only — social posts, ads, marketplace listings.
 * Never accesses private accounts.
 */
app.post('/api/vigilax/cannabis-monitor', scanLimiter, requireApiKey, (req, res) => {
  const { signals, operator_name, province } = req.body || {};
  if (!signals || !Array.isArray(signals)) {
    return res.status(400).json({ error: 'signals[] array required. Must be PUBLIC sources only.' });
  }
  runAndAlert(cannabisMonitor.monitorPublicSignals, { signals, operator_name, province }, {}, res);
});

// ── Review Queue (human oversight) ───────────────────────────────────────────
reviewQueue.registerRoutes(app, requireApiKey, generalLimiter);

// ── Evidence Package ──────────────────────────────────────────────────────────

/**
 * POST /api/evidence/generate
 * Body: { scan_result: {...}, metadata: { case_id, investigator, client_name, notes } }
 */
app.post('/api/evidence/generate', generalLimiter, requireApiKey, (req, res) => {
  const { scan_result, metadata, format = 'json' } = req.body || {};
  if (!scan_result) return res.status(400).json({ error: 'scan_result required' });

  try {
    const pkg = evidence.buildEvidencePackage(scan_result, metadata || {});

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(evidence.generateHTMLReport(pkg));
    }
    if (format === 'text' || format === 'le') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="VX-${pkg.package_id}.txt"`);
      return res.send(evidence.generateLEReport(pkg));
    }

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Evidence generation failed', message: err.message });
  }
});

// ── Alert Management ──────────────────────────────────────────────────────────

app.get('/api/alerts', generalLimiter, requireApiKey, (req, res) => {
  const { limit, severity, engine, since } = req.query;
  res.json({
    alerts: alerts.getAlerts({
      limit: parseInt(limit) || 50,
      severity: severity || null,
      engine: engine || null,
      since: since || null,
    }),
    ws_url: `wss://${req.headers.host}/ws/alerts`,
  });
});

app.delete('/api/alerts', requireApiKey, (req, res) => {
  alerts.clearAlerts();
  res.json({ message: 'Alert queue cleared' });
});

// ── Connectors status ─────────────────────────────────────────────────────────

app.get('/api/connectors', requireApiKey, (req, res) => {
  res.json({
    connectors: {
      google_ads:   { status: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'configured' : 'not_configured', docs: 'Set GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET' },
      facebook_ads: { status: process.env.FB_ACCESS_TOKEN ? 'configured' : 'not_configured',           docs: 'Set FB_ACCESS_TOKEN, FB_AD_ACCOUNT_ID' },
      amazon_ads:   { status: process.env.AMAZON_ADS_CLIENT_ID ? 'configured' : 'not_configured',      docs: 'Set AMAZON_ADS_CLIENT_ID, AMAZON_ADS_CLIENT_SECRET' },
      twitter:      { status: process.env.TWITTER_BEARER_TOKEN ? 'configured' : 'not_configured',       docs: 'Set TWITTER_BEARER_TOKEN' },
      instagram:    { status: process.env.IG_ACCESS_TOKEN ? 'configured' : 'not_configured',            docs: 'Set IG_ACCESS_TOKEN (via Facebook Graph API)' },
      sendgrid:     { status: process.env.SENDGRID_API_KEY ? 'configured' : 'not_configured',           docs: 'Set SENDGRID_API_KEY for email alerts' },
      smtp:         { status: process.env.SMTP_HOST ? 'configured' : 'not_configured',                  docs: 'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS' },
    },
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  VIGILAX Sentinel v1.0 — ONLINE              ║`);
  console.log(`║  Francisco Holdings Inc.                      ║`);
  console.log(`╠══════════════════════════════════════════════╣`);
  console.log(`║  Port:     ${PORT}                               ║`);
  console.log(`║  Engines:  5 (click/review/influencer/ad/gov) ║`);
  console.log(`║  Industry: ${(industryProfiles.industries?.length || 0).toString().padEnd(3)} profiles loaded               ║`);
  console.log(`║  WS:       /ws/alerts                         ║`);
  console.log(`║  Alerts:   ${process.env.ALERT_EMAIL || 'franciscoderek7@gmail.com'}   ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);
});

module.exports = { app, server };
