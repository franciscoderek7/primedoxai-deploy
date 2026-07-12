/**
 * Empire Outreach Email Service — Resend API
 * Templates: cold outreach, follow-up, trial welcome
 * Tracks opens/clicks via Resend webhooks → POST /api/email/webhook
 */

let _resend = null;

function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('Resend not configured — set RESEND_API_KEY');
    const { Resend } = require('resend');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM     = process.env.EMAIL_FROM     || 'PrimeDox AI <outreach@primedoxai.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'franciscoderek7@gmail.com';

// ── Templates ─────────────────────────────────────────────────────────────────

function coldOutreachHtml(lead) {
  const domain   = lead.domain || 'your website';
  const score    = lead.score ?? lead.present_score ?? 50;
  const gapCount = lead.gap_count || lead.issues?.length || 0;
  const value    = lead.est_value_cad || gapCount * 600;
  const scoreColor = score >= 70 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
  const topGaps  = (lead.issues || []).slice(0, 3);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revenue Intelligence Report — ${domain}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0A0A0A;color:#E8E4DC;margin:0;padding:20px 0;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0B3D2E 0%,#0F0F0F 100%);border:1px solid #C9A227;border-radius:12px 12px 0 0;padding:28px 32px;">
    <div style="font-size:22px;font-weight:900;color:#C9A227;letter-spacing:-0.5px;">⚡ Revenue Intelligence Report</div>
    <div style="font-size:11px;color:#7A7570;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Francisco Holdings Inc. · Empire Gap Scanner v2.0</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#111111;border:1px solid #222222;border-top:none;padding:28px 32px;">

    <p style="font-size:15px;line-height:1.8;margin:0 0 16px;">Hi,</p>
    <p style="font-size:15px;line-height:1.8;margin:0 0 16px;">
      I ran a full website audit on <strong style="color:#C9A227;">${domain}</strong> using our Empire Gap Scanner —
      a 12-category revenue analysis tool that checks SSL, mobile, payments, SEO, legal, and more.
    </p>

    <!-- Score Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;border:1px solid #333;border-radius:10px;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#7A7570;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">Audit Summary</div>
        <table width="100%">
          <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#E8E4DC;font-size:14px;">Revenue Health Score</td>
              <td style="text-align:right;padding:8px 0;border-bottom:1px solid #1a1a1a;font-weight:800;color:${scoreColor};font-size:16px;">${score}/100</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;color:#E8E4DC;font-size:14px;">Critical Gaps Found</td>
              <td style="text-align:right;padding:8px 0;border-bottom:1px solid #1a1a1a;font-weight:700;color:#EF4444;font-size:15px;">${gapCount}</td></tr>
          <tr><td style="padding:8px 0;color:#E8E4DC;font-size:14px;">Est. Monthly Revenue Impact</td>
              <td style="text-align:right;padding:8px 0;font-weight:800;color:#C9A227;font-size:15px;">$${value.toLocaleString()} CAD</td></tr>
        </table>
      </td></tr>
    </table>

    ${topGaps.length ? `
    <!-- Top Gaps -->
    <div style="margin:0 0 20px;">
      <div style="font-size:11px;color:#7A7570;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Top Gaps Identified</div>
      ${topGaps.map((gap, i) => `
      <div style="background:#0F0F0F;border-left:3px solid ${i===0?'#EF4444':i===1?'#F59E0B':'#C9A227'};border-radius:0 6px 6px 0;padding:10px 14px;margin-bottom:6px;">
        <div style="font-size:13px;font-weight:700;color:#E8E4DC;">${gap}</div>
      </div>`).join('')}
    </div>` : ''}

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0B3D2E 0%,#0F0F0F 100%);border:1px solid #C9A227;border-radius:10px;margin:20px 0;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:17px;font-weight:800;color:#C9A227;margin-bottom:8px;">Fix All ${gapCount} Gaps with PrimeDox AI</div>
        <div style="font-size:13px;color:#A0A0A0;margin-bottom:18px;max-width:400px;margin-left:auto;margin-right:auto;">
          45 specialized AI agents — each one automatically fixes what's broken and optimizes what's working.
          Average client sees <strong style="color:#C9A227;">+$4,500/month</strong> in recovered revenue within 60 days.
        </div>
        <a href="https://franciscoderek7.github.io/empire-gap-scanner/"
           style="display:inline-block;background:#C9A227;color:#000000;font-weight:800;font-size:14px;padding:13px 26px;border-radius:7px;text-decoration:none;letter-spacing:0.03em;">
          Get Your Full Report + Fix Plan →
        </a>
      </td></tr>
    </table>

    <p style="font-size:14px;color:#7A7570;line-height:1.8;margin:0;">
      Happy to walk you through the full audit on a 15-minute call. No pitch — just the data.<br><br>
      — Derek Francisco<br>
      CEO, Francisco Holdings Inc.<br>
      <a href="https://franciscoholdingsinc.com" style="color:#C9A227;text-decoration:none;">franciscoholdingsinc.com</a>
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0A0A0A;border:1px solid #1a1a1a;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
    <p style="font-size:11px;color:#444;margin:0;line-height:1.8;">
      You're receiving this because your website was publicly scanned using our non-invasive revenue gap analysis tool.
      This is a one-time outreach.<br>
      <a href="mailto:${REPLY_TO}?subject=Unsubscribe from PrimeDox AI&body=Please remove me from your list." style="color:#555;">Unsubscribe</a> ·
      Francisco Holdings Inc. · Lindsay, Ontario, Canada
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function followUpHtml(lead) {
  const domain = lead.domain || 'your website';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#0A0A0A;color:#E8E4DC;padding:40px 20px;">
<div style="max-width:560px;margin:0 auto;">
  <p style="font-size:15px;line-height:1.8;">Hi,</p>
  <p style="font-size:15px;line-height:1.8;">
    Following up on the revenue gap report I sent for <strong style="color:#C9A227;">${domain}</strong>.<br><br>
    The ${lead.gap_count || 'several'} gaps identified are costing you an estimated
    <strong style="color:#C9A227;">$${(lead.est_value_cad || 2000).toLocaleString()}/month</strong> in missed revenue.
    Takes us about 2 weeks to deploy the AI agents that fix all of them.
  </p>
  <p style="font-size:15px;line-height:1.8;">
    Worth 15 minutes?<br><br>
    — Derek Francisco, Francisco Holdings Inc.
  </p>
  <p style="font-size:11px;color:#444;margin-top:32px;">
    <a href="mailto:${REPLY_TO}?subject=Unsubscribe" style="color:#555;">Unsubscribe</a>
  </p>
</div>
</body></html>`;
}

function trialWelcomeHtml(email) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,sans-serif;background:#0A0A0A;color:#E8E4DC;padding:40px 20px;">
<div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #C9A227;border-radius:12px;padding:32px;">
  <div style="font-size:22px;font-weight:900;color:#C9A227;margin-bottom:16px;">⚡ Welcome to PrimeDox AI Gap Scanner Pro</div>
  <p style="font-size:15px;line-height:1.8;margin:0 0 16px;">Your trial is now active.</p>
  <p style="font-size:15px;line-height:1.8;margin:0 0 16px;">
    You have full access to the Empire Gap Scanner — scan unlimited URLs, export PDF reports,
    and access the Empire Dashboard for all 47 Francisco Holdings companies.
  </p>
  <a href="https://franciscoderek7.github.io/empire-gap-scanner/"
     style="display:inline-block;background:#C9A227;color:#000;font-weight:800;font-size:14px;padding:13px 26px;border-radius:7px;text-decoration:none;margin-top:8px;">
    Open Gap Scanner →
  </a>
  <p style="font-size:13px;color:#7A7570;margin-top:24px;">
    Questions? Reply to this email or reach us at <a href="https://franciscoholdingsinc.com" style="color:#C9A227;">franciscoholdingsinc.com</a>
  </p>
</div>
</body></html>`;
}

// ── Send functions ────────────────────────────────────────────────────────────

async function sendOutreach(lead) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to: [lead.email],
    reply_to: REPLY_TO,
    subject: `We scanned ${lead.domain || 'your site'} — found ${lead.gap_count || 'critical'} revenue gaps`,
    html: coldOutreachHtml(lead),
    tags: [
      { name: 'type',   value: 'cold_outreach' },
      { name: 'domain', value: (lead.domain || 'unknown').replace(/[^a-z0-9_\-]/gi, '_').slice(0, 50) },
    ],
  });
}

async function sendFollowUp(lead) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM, to: [lead.email], reply_to: REPLY_TO,
    subject: `Following up — ${lead.domain || 'your site'} revenue gaps`,
    html: followUpHtml(lead),
    tags: [{ name: 'type', value: 'follow_up' }],
  });
}

async function sendTrialWelcome(email) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM, to: [email], reply_to: REPLY_TO,
    subject: 'Your PrimeDox AI Gap Scanner trial is active',
    html: trialWelcomeHtml(email),
    tags: [{ name: 'type', value: 'trial_welcome' }],
  });
}

async function sendBulkOutreach(leads) {
  const results = [];
  for (const lead of leads) {
    if (!lead.email) { results.push({ id: lead.id, skipped: true, reason: 'no email' }); continue; }
    try {
      const r = await sendOutreach(lead);
      results.push({ id: lead.id, success: true, emailId: r.data?.id });
      await new Promise(resolve => setTimeout(resolve, 250)); // rate limit: 4/s
    } catch (err) {
      results.push({ id: lead.id, success: false, error: err.message });
    }
  }
  return results;
}

// ── Express route registration ────────────────────────────────────────────────

function registerEmailRoutes(app, limiter) {
  // POST /api/email/send-outreach
  app.post('/api/email/send-outreach', limiter, async (req, res) => {
    const { lead } = req.body || {};
    if (!lead?.email) return res.status(400).json({ error: 'lead.email required' });
    try {
      const r = await sendOutreach(lead);
      res.json({ success: true, emailId: r.data?.id });
    } catch (err) {
      if (err.message.includes('not configured')) return res.status(503).json({ error: err.message });
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/email/send-followup
  app.post('/api/email/send-followup', limiter, async (req, res) => {
    const { lead } = req.body || {};
    if (!lead?.email) return res.status(400).json({ error: 'lead.email required' });
    try {
      const r = await sendFollowUp(lead);
      res.json({ success: true, emailId: r.data?.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/email/send-bulk  — max 50 per batch
  app.post('/api/email/send-bulk', limiter, async (req, res) => {
    const { leads } = req.body || {};
    if (!Array.isArray(leads) || !leads.length) return res.status(400).json({ error: 'leads array required' });
    if (leads.length > 50) return res.status(400).json({ error: 'Max 50 per batch' });
    try {
      const results = await sendBulkOutreach(leads);
      res.json({ success: true, results, sent: results.filter(r => r.success).length, skipped: results.filter(r => r.skipped).length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/email/webhook  — Resend event webhook (opens, clicks, bounces)
  app.post('/api/email/webhook', async (req, res) => {
    const event = req.body;
    if (event?.type) {
      console.log(`[resend webhook] ${event.type} — ${event.data?.email_id || '?'}`);
      // TODO: write to email_events table in Supabase
    }
    res.status(200).json({ received: true });
  });
}

module.exports = { sendOutreach, sendFollowUp, sendTrialWelcome, sendBulkOutreach, registerEmailRoutes };
