/**
 * Lead Database — Supabase
 * Persistent storage for gap scanner leads with CRUD operations.
 * Schema: see db/schema.sql
 */

const { createClient } = require('@supabase/supabase-js');

let _db = null;

function getDb() {
  if (!_db) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    }
    _db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }
  return _db;
}

function scoreToLeadType(score) {
  if (score == null) return 'UNKNOWN';
  if (score <= 40)   return 'HOT';
  if (score <= 60)   return 'WARM';
  if (score <= 80)   return 'COLD';
  return 'PASS';
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

async function saveLead(scanData) {
  const db = getDb();

  let domain = scanData.domain;
  if (!domain && scanData.url) {
    try { domain = new URL(scanData.url).hostname.replace(/^www\./, ''); } catch { domain = scanData.url; }
  }

  const score   = scanData.score ?? scanData.present_score ?? null;
  const gapList = scanData.gaps_found?.map(g => g.title || g.id) || scanData.issues || [];

  const row = {
    url:               scanData.url,
    domain,
    business_name:     scanData.business_name || null,
    score,
    lead_type:         scoreToLeadType(score),
    gap_count:         scanData.gap_count || scanData.gaps_count || gapList.length,
    issues:            gapList,
    est_value_cad:     scanData.agentforge_quote?.estimated_monthly_value_recovered_cad
                         || scanData.est_value_cad
                         || null,
    detected_industry: scanData.detected_industry || null,
    email:             scanData.email || null,
    raw_scan:          scanData,
    updated_at:        new Date().toISOString(),
  };

  const { data, error } = await db
    .from('leads')
    .upsert(row, { onConflict: 'url' })
    .select('id, lead_type, score')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function getLeads(filters = {}) {
  const db = getDb();

  const cols = 'id,url,domain,business_name,score,lead_type,gap_count,issues,contacted,contacted_at,email,est_value_cad,detected_industry,created_at,updated_at';
  let q = db.from('leads').select(cols);

  if (filters.lead_type)              q = q.eq('lead_type', filters.lead_type.toUpperCase());
  if (filters.contacted !== undefined) q = q.eq('contacted', filters.contacted === 'true' || filters.contacted === true);
  if (filters.domain)                 q = q.ilike('domain', `%${filters.domain}%`);
  if (filters.min_score)              q = q.gte('score', Number(filters.min_score));
  if (filters.max_score)              q = q.lte('score', Number(filters.max_score));
  if (filters.industry)               q = q.ilike('detected_industry', `%${filters.industry}%`);

  const limit = Math.min(Number(filters.limit) || 100, 500);
  q = q.order('created_at', { ascending: false }).limit(limit);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

async function getLead(id) {
  const db = getDb();
  const { data, error } = await db.from('leads').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

async function markContacted(id, email) {
  const db = getDb();
  const update = { contacted: true, contacted_at: new Date().toISOString() };
  if (email) update.email = email;

  const { data, error } = await db.from('leads').update(update).eq('id', id).select('id').single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateLeadEmail(id, email) {
  const db = getDb();
  const { data, error } = await db.from('leads').update({ email }).eq('id', id).select('id').single();
  if (error) throw new Error(error.message);
  return data;
}

async function deleteLead(id) {
  const db = getDb();
  const { error } = await db.from('leads').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

async function getStats() {
  const db = getDb();
  const { data, error } = await db.from('leads').select('lead_type, contacted, est_value_cad');
  if (error) throw new Error(error.message);

  const stats = { total: data.length, hot: 0, warm: 0, cold: 0, pass: 0, contacted: 0, totalValueCad: 0 };
  for (const row of data) {
    if (row.lead_type === 'HOT')  stats.hot++;
    if (row.lead_type === 'WARM') stats.warm++;
    if (row.lead_type === 'COLD') stats.cold++;
    if (row.lead_type === 'PASS') stats.pass++;
    if (row.contacted)            stats.contacted++;
    stats.totalValueCad += row.est_value_cad || 0;
  }
  return stats;
}

// ── Express route registration ────────────────────────────────────────────────

function registerLeadRoutes(app, limiter) {
  // GET /api/leads
  app.get('/api/leads', limiter, async (req, res) => {
    try {
      const leads = await getLeads(req.query);
      res.json({ success: true, leads, count: leads.length });
    } catch (err) {
      if (err.message.includes('not configured')) return res.status(503).json({ error: err.message, note: 'Set SUPABASE_URL + SUPABASE_SERVICE_KEY to enable lead persistence' });
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/leads/stats
  app.get('/api/leads/stats', limiter, async (req, res) => {
    try {
      res.json({ success: true, stats: await getStats() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/leads/:id
  app.get('/api/leads/:id', limiter, async (req, res) => {
    try {
      res.json({ success: true, lead: await getLead(req.params.id) });
    } catch (err) {
      res.status(404).json({ error: 'Lead not found' });
    }
  });

  // POST /api/leads  — persist a completed scan
  app.post('/api/leads', limiter, async (req, res) => {
    const { scan } = req.body || {};
    if (!scan?.url) return res.status(400).json({ error: 'scan.url required' });
    try {
      const result = await saveLead(scan);
      res.json({ success: true, leadId: result.id, leadType: result.lead_type, score: result.score });
    } catch (err) {
      if (err.message.includes('not configured')) return res.status(503).json({ error: err.message, note: 'Configure Supabase to enable persistence' });
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/leads/:id/contact  — mark contacted + optional email
  app.patch('/api/leads/:id/contact', limiter, async (req, res) => {
    const { email } = req.body || {};
    try {
      await markContacted(req.params.id, email);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/leads/:id/email  — update email
  app.patch('/api/leads/:id/email', limiter, async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    try {
      await updateLeadEmail(req.params.id, email);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/leads/:id
  app.delete('/api/leads/:id', limiter, async (req, res) => {
    try {
      await deleteLead(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { saveLead, getLeads, getLead, markContacted, updateLeadEmail, getStats, registerLeadRoutes };
