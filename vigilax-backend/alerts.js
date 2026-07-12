/**
 * VIGILAX — Alert & Reporting System
 * WebSocket real-time push + email notifications + alert queue.
 */

'use strict';

const EventEmitter = require('events');

let wss = null;      // WebSocket.Server instance (set by server.js)
let nodemailer = null;
let transporter = null;

const ALERT_EMAIL = process.env.ALERT_EMAIL || 'franciscoderek7@gmail.com';

// ── Alert queue (in-memory; swap for Redis when needed) ─────────────────────

const alertQueue = [];
const MAX_QUEUE = 500;

// ── Initialize WebSocket server ──────────────────────────────────────────────

function attachWebSocket(websocketServer) {
  wss = websocketServer;
  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'VIGILAX Sentinel connected', timestamp: Date.now() }));
  });

  // Heartbeat to clean dead connections
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));
  console.log('[vigilax] WebSocket alert channel ready');
}

// ── Initialize email (lazy-load nodemailer) ──────────────────────────────────

async function initEmail() {
  if (transporter) return transporter;
  try {
    nodemailer = require('nodemailer');
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else if (process.env.SENDGRID_API_KEY) {
      transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
      });
    } else {
      // Ethereal test account fallback
      const testAcc = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false,
        auth: { user: testAcc.user, pass: testAcc.pass },
      });
      console.log('[vigilax] Email: using Ethereal test account (set SMTP_HOST or SENDGRID_API_KEY for production)');
    }
  } catch (err) {
    console.warn('[vigilax] Email not available:', err.message);
  }
  return transporter;
}

// ── Send alert ────────────────────────────────────────────────────────────────

async function sendAlert(alert) {
  const normalized = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...alert,
  };

  // Queue
  alertQueue.unshift(normalized);
  if (alertQueue.length > MAX_QUEUE) alertQueue.pop();

  // WebSocket broadcast
  if (wss) {
    const payload = JSON.stringify({ type: 'ALERT', alert: normalized });
    wss.clients.forEach(ws => {
      if (ws.readyState === 1 /* OPEN */) {
        try { ws.send(payload); } catch { /* ignore */ }
      }
    });
  }

  // Email for HIGH/CRITICAL
  if (['HIGH', 'CRITICAL'].includes(alert.severity)) {
    await sendEmailAlert(normalized).catch(err =>
      console.warn('[vigilax] Email failed:', err.message)
    );
  }

  // Slack for HIGH/CRITICAL
  if (['HIGH', 'CRITICAL'].includes(alert.severity)) {
    await sendSlackAlert(normalized).catch(err =>
      console.warn('[vigilax] Slack failed:', err.message)
    );
  }

  // SMS for risk_score >= 90 (CRITICAL only)
  // Fallback: if Twilio not configured, send 3 additional emails instead
  if ((normalized.risk_score ?? 0) >= 90) {
    const hasTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
                      process.env.TWILIO_FROM_NUMBER && process.env.SMS_ALERT_NUMBER;
    if (hasTwilio) {
      await sendSmsAlert(normalized).catch(err =>
        console.warn('[vigilax] SMS failed:', err.message)
      );
    } else {
      // No Twilio — send 3 redundant critical emails with 2s spacing
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, i * 2000));
        await sendEmailAlert({ ...normalized, subject_prefix: `[CRITICAL RESEND ${i + 1}/3]` })
          .catch(err => console.warn(`[vigilax] Critical email resend ${i + 1} failed:`, err.message));
      }
      console.log('[vigilax] SMS not configured — sent 3x critical email fallback');
    }
  }

  return normalized;
}

async function sendEmailAlert(alert) {
  const t = await initEmail();
  if (!t) return;

  const severityColor = { CRITICAL: '#E53E3E', HIGH: '#D4A017', MEDIUM: '#4A9EE5', LOW: '#2ECC71' };
  const color = severityColor[alert.severity] || '#888';

  const html = `
<div style="font-family:monospace;background:#0A0A0A;color:#D4D8D5;padding:24px;max-width:600px;border:1px solid #1F3028;border-radius:6px">
  <div style="border-left:4px solid ${color};padding-left:14px;margin-bottom:20px">
    <h2 style="color:${color};margin:0;font-size:16px">⚠️ VIGILAX SENTINEL — ${alert.severity} ALERT</h2>
    <p style="color:#6B7C72;font-size:11px;margin:4px 0 0">${alert.timestamp}</p>
  </div>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="color:#6B7C72;padding:6px 0;font-size:12px;width:140px">Engine</td><td style="color:#E5E4E2;font-size:12px">${alert.engine || '—'}</td></tr>
    <tr><td style="color:#6B7C72;padding:6px 0;font-size:12px">Verdict</td><td style="color:${color};font-weight:bold;font-size:12px">${alert.verdict || '—'}</td></tr>
    <tr><td style="color:#6B7C72;padding:6px 0;font-size:12px">Risk Score</td><td style="color:#E5E4E2;font-size:12px">${alert.risk_score ?? '—'} / 100</td></tr>
    <tr><td style="color:#6B7C72;padding:6px 0;font-size:12px">Target</td><td style="color:#E5E4E2;font-size:12px">${alert.target || alert.campaign_id || alert.domain || alert.username || '—'}</td></tr>
    <tr><td style="color:#6B7C72;padding:6px 0;font-size:12px">Findings</td><td style="color:#E5E4E2;font-size:12px">${alert.findings_count ?? (alert.findings?.length ?? '—')}</td></tr>
  </table>
  ${alert.description ? `<p style="background:#18221C;padding:12px;border-radius:4px;margin-top:16px;font-size:12px;color:#D4D8D5">${alert.description}</p>` : ''}
  ${alert.recommended_action ? `<div style="border-top:1px solid #1F3028;margin-top:16px;padding-top:16px"><p style="color:#6B7C72;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px">Recommended Action</p><p style="font-size:12px;color:#C9A227;margin:0">${alert.recommended_action}</p></div>` : ''}
  <div style="margin-top:20px;padding-top:14px;border-top:1px solid #1F3028">
    <p style="color:#6B7C72;font-size:10px;margin:0">VIGILAX Sentinel | Francisco Holdings Inc. | Alert ID: ${alert.id}</p>
  </div>
</div>`;

  const info = await t.sendMail({
    from: `"VIGILAX Sentinel" <${process.env.SMTP_USER || 'sentinel@vigilax.com'}>`,
    to: ALERT_EMAIL,
    subject: `${alert.subject_prefix ? alert.subject_prefix + ' ' : ''}[VIGILAX ${alert.severity}] ${alert.engine?.toUpperCase() || 'FRAUD'} — Score ${alert.risk_score}/100`,
    html,
    text: `VIGILAX ALERT — ${alert.severity}\nEngine: ${alert.engine}\nVerdict: ${alert.verdict}\nRisk Score: ${alert.risk_score}/100\nAction: ${alert.recommended_action}`,
  });

  console.log(`[vigilax] Email sent: ${info.messageId}`);
  return info;
}

// ── Slack alert ───────────────────────────────────────────────────────────────

async function sendSlackAlert(alert) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const severityEmoji = { CRITICAL: ':rotating_light:', HIGH: ':warning:', MEDIUM: ':large_yellow_circle:', LOW: ':white_check_mark:' };
  const emoji = severityEmoji[alert.severity] || ':bell:';

  const body = JSON.stringify({
    username: 'VIGILAX Sentinel',
    icon_emoji: ':shield:',
    channel: process.env.SLACK_CHANNEL || '#vigilax-alerts',
    text: `${emoji} *VIGILAX ${alert.severity} ALERT*`,
    attachments: [{
      color: alert.severity === 'CRITICAL' ? '#E53E3E' : alert.severity === 'HIGH' ? '#D4A017' : '#4A9EE5',
      fields: [
        { title: 'Engine',     value: alert.engine  || '—', short: true },
        { title: 'Verdict',    value: alert.verdict || '—', short: true },
        { title: 'Risk Score', value: `${alert.risk_score ?? '—'}/100`, short: true },
        { title: 'Severity',   value: alert.severity || '—', short: true },
        { title: 'Target',     value: alert.target || alert.campaign_id || alert.domain || alert.username || '—', short: false },
        ...(alert.recommended_action ? [{ title: 'Action', value: alert.recommended_action, short: false }] : []),
      ],
      footer: `VIGILAX Sentinel | ${alert.id}`,
      ts: Math.floor(Date.now() / 1000),
    }],
  });

  const url = new URL(webhookUrl);
  const lib = url.protocol === 'https:' ? require('https') : require('http');

  await new Promise((resolve, reject) => {
    const req = lib.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      res.on('data', () => {});
      res.on('end', () => resolve());
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Slack timeout')); });
    req.write(body);
    req.end();
  });

  console.log(`[vigilax] Slack alert sent: ${alert.id}`);
}

// ── SMS alert (Twilio — score >= 90 only) ─────────────────────────────────────

async function sendSmsAlert(alert) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;
  const to    = process.env.SMS_ALERT_NUMBER;

  if (!sid || !token || !from || !to) return;

  const message = [
    `VIGILAX CRITICAL ALERT`,
    `Engine: ${alert.engine || '?'}`,
    `Score: ${alert.risk_score}/100`,
    `Verdict: ${alert.verdict || '?'}`,
    `Target: ${alert.target || alert.campaign_id || alert.domain || alert.username || '?'}`,
    `Review required. No action without human sign-off.`,
    `ID: ${alert.id}`,
  ].join('\n');

  const body = new URLSearchParams({ From: from, To: to, Body: message }).toString();
  const auth  = Buffer.from(`${sid}:${token}`).toString('base64');

  await new Promise((resolve, reject) => {
    const req = require('https').request({
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${sid}/Messages.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Basic ${auth}`,
      },
    }, res => {
      let raw = '';
      res.on('data', d => { raw += d; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(raw));
        else reject(new Error(`Twilio ${res.statusCode}: ${raw}`));
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Twilio timeout')); });
    req.write(body);
    req.end();
  });

  console.log(`[vigilax] SMS sent to ${to} for alert ${alert.id}`);
}

// ── Get recent alerts ─────────────────────────────────────────────────────────

function getAlerts({ limit = 50, severity, engine, since } = {}) {
  let alerts = [...alertQueue];
  if (severity) alerts = alerts.filter(a => a.severity === severity);
  if (engine)   alerts = alerts.filter(a => a.engine === engine);
  if (since)    alerts = alerts.filter(a => new Date(a.timestamp) > new Date(since));
  return alerts.slice(0, limit);
}

function clearAlerts() {
  alertQueue.length = 0;
}

module.exports = { attachWebSocket, sendAlert, getAlerts, clearAlerts, initEmail };
