/**
 * Cross-Industry Gap Detection Engine
 * Fetches a customer URL, scores it against industry benchmarks, returns AgentForge quote.
 */

const https = require('https');
const http = require('http');
const url = require('url');
const path = require('path');

let industryProfiles = null;

function loadProfiles() {
  if (!industryProfiles) {
    industryProfiles = require('./industry-profiles.json');
  }
  return industryProfiles;
}

// ── HTTP Fetcher ────────────────────────────────────────────────────────────

function fetchPage(targetUrl, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new url.URL(targetUrl); } catch {
      return reject(new Error(`Invalid URL: ${targetUrl}`));
    }

    const proto = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      method: 'GET',
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'PrimeDox-GapScanner/1.0 (+https://primedoxaihq.com/gap-scanner)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-CA,en;q=0.9',
      },
    };

    const req = proto.request(options, (res) => {
      // Follow single redirect
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.hostname}${res.headers.location}`;
        return fetchPage(redirectUrl, timeoutMs).then(resolve).catch(reject);
      }

      const chunks = [];
      res.on('data', (c) => { chunks.push(c); if (Buffer.concat(chunks).length > 512000) req.destroy(); });
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString('utf-8', 0, 512000),
        finalUrl: targetUrl,
        ssl: parsed.protocol === 'https:',
      }));
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.on('error', reject);
    req.end();
  });
}

// ── Evidence Engine ─────────────────────────────────────────────────────────

function extractEvidence(page) {
  const body = page.body.toLowerCase();
  const headers = page.headers;

  return {
    ssl: page.ssl,
    status: page.status,
    mobile_viewport: /viewport/.test(body),
    has_title: /<title[^>]*>[^<]{5,}/.test(body),
    has_og_meta: /og:title|og:description/.test(body),
    has_analytics: /google-analytics|gtag\(|ga\(|_gaq|googletagmanager|plausible|posthog|hotjar|segment/.test(body),
    has_online_booking: /book\s?(now|appointment|online)|schedule\s?online|calendly|acuity|setmore|mindbody|booker|vagaro|fresha|timely|jane\.app|squareup\.com\/appointments/.test(body),
    has_live_chat: /livechat|intercom|drift\.com|tawk\.to|crisp\.chat|freshchat|zendesk|olark|hubspot|tidio|smartsupp|chatra|userlike/.test(body),
    has_review_widget: /reviews\.io|trustpilot|google.*reviews|review-widget|stars-rating|star-rating|g2\.com|capterra/.test(body),
    has_contact_form: /contact.*form|<form[^>]*>[\s\S]{0,500}(submit|send|contact|email)/i.test(page.body),
    has_newsletter: /newsletter|subscribe|email.*list|mailchimp|klaviyo|constant.?contact/.test(body),
    has_payment: /stripe|paypal|square|shopify|woocommerce|add.to.cart|buy.now|checkout/.test(body),
    has_social_links: /facebook\.com|instagram\.com|twitter\.com|x\.com|linkedin\.com|tiktok\.com/.test(body),
    has_faq: /faq|frequently.asked|accordion/.test(body),
    has_sitemap: /sitemap/.test(body) || /sitemap/i.test(headers['x-robots-tag'] || ''),
    response_time_ms: page.responseTimeMs || null,
    server: headers.server || null,
    content_security_policy: !!headers['content-security-policy'],
  };
}

// ── Industry Detector ───────────────────────────────────────────────────────

const INDUSTRY_SIGNALS = {
  dental: /dentist|dental|orthodont|teeth\s?whitening|invisalign|braces|oral.surgery|periodont/,
  legal_criminal: /attorney|lawyer|law\s?firm|legal\s?advice|criminal\s?defence|family\s?law|paralegal/,
  automotive_dealership: /dealership|auto\s?dealer|new\s?cars|used\s?cars|car\s?lot|test\s?drive|trade.in/,
  automotive_repair: /auto\s?repair|mechanic|oil\s?change|tire\s?shop|brake\s?service|collision/,
  construction_roofing: /roofing|roofer|roof\s?replacement|shingle|contractor/,
  plumbing: /plumb|plumber|drain|pipe\s?repair|water\s?heater/,
  hvac: /hvac|heating|cooling|furnace|air\s?condition|heat\s?pump/,
  electrical: /electrician|electrical\s?contractor|panel\s?upgrade|wiring/,
  restaurant: /restaurant|menu|dine.in|takeout|reservation|food\s?order|cuisine/,
  real_estate: /realtor|real\s?estate|homes\s?for\s?sale|mls|property\s?listing|open\s?house/,
  fitness: /gym|fitness|yoga|personal\s?train|crossfit|pilates|workout|membership/,
  cleaning: /cleaning\s?service|maid|janitorial|commercial\s?clean|house\s?clean/,
  accounting: /accountant|accounting|bookkeeping|tax\s?service|cpa|payroll/,
  insurance: /insurance|broker|policy|coverage|quotes|life\s?insurance|home\s?insurance/,
  ecommerce: /shop\s?now|add.to.cart|free\s?shipping|product\s?catalog|online\s?store/,
  childcare: /daycare|child\s?care|preschool|after.school|babysitter|nanny/,
  hospitality_hotel: /hotel|motel|bed.and.breakfast|inn|resort|check.in|room\s?booking/,
  pet_services: /veterinar|vet\s?clinic|pet\s?groomin|dog\s?boarding|pet\s?hotel|kennel/,
  medical_clinic: /clinic|physician|doctor|medical\s?centre|family\s?medicine|walk.in/,
  financial_advisory: /financial\s?advisor|wealth\s?management|investment|retirement\s?planning|portfolio/,
  property_management: /property\s?management|tenant|landlord|rental\s?units|leasing\s?office/,
  marketing_agency: /digital\s?marketing|seo\s?agency|ppc|social\s?media\s?marketing|branding\s?agency/,
  recruiting: /staffing|recruitment|talent\s?acquisition|job\s?placement|headhunter|hiring\s?solutions/,
  salon_beauty: /hair\s?salon|beauty\s?salon|nail\s?salon|spa\s?services|barber|esthetician|blowout/,
};

function detectIndustry(body, hostname) {
  const text = body.toLowerCase();
  const scores = {};
  for (const [industry, pattern] of Object.entries(INDUSTRY_SIGNALS)) {
    const matches = (text.match(pattern) || []).length;
    if (matches > 0) scores[industry] = matches;
  }
  if (Object.keys(scores).length === 0) return 'unknown';
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// ── Gap Score Calculator ────────────────────────────────────────────────────
// Categories: Website(20) + CX(20) + Automation(20) + Marketing(15) + Ops(10) + Security(10) + Accessibility(5)

function calcGapScore(evidence, profile) {
  const bm = profile ? profile.benchmarks : {};

  const website = scoreCategory([
    { label: 'Mobile viewport meta tag', earned: evidence.mobile_viewport ? 8 : 0, max: 8 },
    { label: 'SSL / HTTPS', earned: evidence.ssl ? 7 : 0, max: 7 },
    { label: 'Page title tag', earned: evidence.has_title ? 5 : 0, max: 5 },
  ]);

  const cx = scoreCategory([
    { label: 'Online booking or scheduling', earned: evidence.has_online_booking ? 10 : 0, max: 10, benchmark: bm.has_online_booking },
    { label: 'Live chat widget', earned: evidence.has_live_chat ? 6 : 0, max: 6, benchmark: bm.has_live_chat },
    { label: 'Contact form', earned: evidence.has_contact_form ? 4 : 0, max: 4 },
  ]);

  const automation = scoreCategory([
    { label: 'Analytics tracking (GA4 / equivalent)', earned: evidence.has_analytics ? 7 : 0, max: 7 },
    { label: 'Review widget / social proof', earned: evidence.has_review_widget ? 7 : 0, max: 7, benchmark: bm.has_review_system },
    { label: 'Newsletter / email capture', earned: evidence.has_newsletter ? 6 : 0, max: 6 },
  ]);

  const marketing = scoreCategory([
    { label: 'OG / social meta tags', earned: evidence.has_og_meta ? 7 : 0, max: 7 },
    { label: 'Social media links', earned: evidence.has_social_links ? 5 : 0, max: 5 },
    { label: 'FAQ section', earned: evidence.has_faq ? 3 : 0, max: 3 },
  ]);

  const ops = scoreCategory([
    { label: 'Payment / e-commerce capability', earned: evidence.has_payment ? 10 : 0, max: 10 },
  ]);

  const security = scoreCategory([
    { label: 'HTTPS encryption', earned: evidence.ssl ? 6 : 0, max: 6 },
    { label: 'Content-Security-Policy header', earned: evidence.content_security_policy ? 4 : 0, max: 4 },
  ]);

  const accessibility = scoreCategory([
    { label: 'Sitemap reference', earned: evidence.has_sitemap ? 5 : 0, max: 5 },
  ]);

  const totalEarned = website.earned + cx.earned + automation.earned + marketing.earned + ops.earned + security.earned + accessibility.earned;
  const totalMax = 20 + 20 + 20 + 15 + 10 + 10 + 5;
  const presentScore = Math.round((totalEarned / totalMax) * 100);
  const gapScore = 100 - presentScore; // Higher = more opportunity

  return {
    gap_score: gapScore,
    present_score: presentScore,
    categories: {
      website: { ...website, weight: 20, gap: 20 - website.earned },
      customer_experience: { ...cx, weight: 20, gap: 20 - cx.earned },
      automation: { ...automation, weight: 20, gap: 20 - automation.earned },
      marketing: { ...marketing, weight: 15, gap: 15 - marketing.earned },
      operations: { ...ops, weight: 10, gap: 10 - ops.earned },
      security: { ...security, weight: 10, gap: 10 - security.earned },
      accessibility: { ...accessibility, weight: 5, gap: 5 - accessibility.earned },
    },
  };
}

function scoreCategory(items) {
  const earned = items.reduce((s, i) => s + i.earned, 0);
  const max = items.reduce((s, i) => s + i.max, 0);
  return { earned, max, items };
}

// ── Gap Narrative Builder ───────────────────────────────────────────────────

function buildGaps(evidence, profile) {
  const gaps = [];

  if (!evidence.has_online_booking) gaps.push({
    id: 'no_booking',
    priority: 'HIGH',
    title: 'No online booking system detected',
    impact: profile ? `Industry average: ${Math.round((profile.benchmarks.has_online_booking || 0.5) * 100)}% of competitors have online booking` : 'Most competitors have online booking',
    fix: 'Deploy Booking Agent — 24/7 appointment scheduling without staff overhead',
    agent: 'booking_agent',
    monthly_value_cad: 800,
  });

  if (!evidence.has_live_chat) gaps.push({
    id: 'no_chat',
    priority: 'HIGH',
    title: 'No live chat or AI chat widget',
    impact: 'Visitors who can\'t get immediate answers leave within 3 minutes',
    fix: 'Deploy Chat Agent — instant responses, lead qualification, FAQ handling',
    agent: 'chat_agent',
    monthly_value_cad: 600,
  });

  if (!evidence.has_analytics) gaps.push({
    id: 'no_analytics',
    priority: 'HIGH',
    title: 'No analytics tracking detected',
    impact: 'Flying blind — no data on what traffic converts or where visitors drop',
    fix: 'Deploy Analytics Agent + GA4 setup — track every touchpoint',
    agent: 'analytics_agent',
    monthly_value_cad: 400,
  });

  if (!evidence.has_review_widget) gaps.push({
    id: 'no_reviews',
    priority: 'MEDIUM',
    title: 'No review collection system',
    impact: '92% of consumers read reviews before purchasing — missing trust signals',
    fix: 'Deploy Review Agent — automated post-visit review requests via SMS/email',
    agent: 'review_agent',
    monthly_value_cad: 500,
  });

  if (!evidence.has_og_meta) gaps.push({
    id: 'no_og',
    priority: 'MEDIUM',
    title: 'Missing social/OG meta tags',
    impact: 'Social shares look broken — no preview image, title, or description',
    fix: 'Deploy SEO Agent — auto-generate OG tags, schema markup, sitemap',
    agent: 'seo_agent',
    monthly_value_cad: 350,
  });

  if (!evidence.mobile_viewport) gaps.push({
    id: 'no_mobile',
    priority: 'HIGH',
    title: 'No mobile viewport tag — site likely broken on phones',
    impact: '60%+ of web traffic is mobile — broken mobile = lost customers',
    fix: 'Emergency mobile fix required before any other work',
    agent: null,
    monthly_value_cad: 1200,
  });

  if (!evidence.ssl) gaps.push({
    id: 'no_ssl',
    priority: 'CRITICAL',
    title: 'No HTTPS / SSL certificate',
    impact: 'Chrome shows "Not Secure" warning — most visitors immediately leave',
    fix: 'Emergency SSL installation required',
    agent: null,
    monthly_value_cad: 900,
  });

  if (!evidence.has_newsletter) gaps.push({
    id: 'no_email_capture',
    priority: 'MEDIUM',
    title: 'No email list capture',
    impact: 'Losing 97% of visitors who don\'t convert on first visit — no retargeting path',
    fix: 'Deploy Lead Capture Agent — exit-intent popup, offer magnet, drip sequence',
    agent: 'lead_agent',
    monthly_value_cad: 700,
  });

  if (!evidence.has_contact_form) gaps.push({
    id: 'no_contact_form',
    priority: 'MEDIUM',
    title: 'No contact form detected',
    impact: 'Phone-only contact kills after-hours leads',
    fix: 'Add contact form with instant email notification',
    agent: 'intake_agent',
    monthly_value_cad: 400,
  });

  return gaps.sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
  });
}

// ── AgentForge Quote Builder ────────────────────────────────────────────────

const AGENT_PRICES_CAD = {
  booking_agent:   { setup: 297, monthly: 97 },
  chat_agent:      { setup: 197, monthly: 79 },
  review_agent:    { setup: 197, monthly: 69 },
  seo_agent:       { setup: 297, monthly: 89 },
  analytics_agent: { setup: 149, monthly: 49 },
  lead_agent:      { setup: 197, monthly: 79 },
  intake_agent:    { setup: 149, monthly: 49 },
  reminder_agent:  { setup: 149, monthly: 49 },
  follow_up_agent: { setup: 149, monthly: 59 },
  social_agent:    { setup: 249, monthly: 89 },
};

const BUNDLE_DISCOUNT = 0.20; // 20% off for 3+ agents

function buildQuote(gaps, profile) {
  const agentIds = [...new Set(gaps.filter(g => g.agent).map(g => g.agent))];
  const agents = agentIds.map(id => ({ id, ...AGENT_PRICES_CAD[id] || { setup: 197, monthly: 69 } }));

  const setupTotal = agents.reduce((s, a) => s + a.setup, 0);
  const monthlyTotal = agents.reduce((s, a) => s + a.monthly, 0);
  const discount = agents.length >= 3 ? BUNDLE_DISCOUNT : 0;

  const monthly_value_recovered = gaps.reduce((s, g) => s + (g.monthly_value_cad || 0), 0);
  const roi_months = monthlyTotal > 0 ? Math.ceil(setupTotal / (monthly_value_recovered - monthlyTotal)) : null;

  return {
    agents_recommended: agents,
    agent_count: agents.length,
    bundle_discount_pct: Math.round(discount * 100),
    setup_cost_cad: Math.round(setupTotal * (1 - discount)),
    monthly_cost_cad: Math.round(monthlyTotal * (1 - discount)),
    estimated_monthly_value_recovered_cad: monthly_value_recovered,
    roi_breakeven_months: roi_months && roi_months > 0 && roi_months < 24 ? roi_months : null,
    cta_url: 'https://primedoxaihq.com/#contact',
    paypal_url: `https://paypal.me/techpetcage/${Math.round(setupTotal * (1 - discount))}CAD`,
  };
}

// ── Main Scanner ────────────────────────────────────────────────────────────

async function scanUrl(targetUrl, options = {}) {
  const profiles = loadProfiles();
  const startMs = Date.now();

  // Normalize URL
  if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

  let page, fetchError;
  try {
    page = await fetchPage(targetUrl, options.timeoutMs || 10000);
    page.responseTimeMs = Date.now() - startMs;
  } catch (err) {
    fetchError = err.message;
  }

  if (!page || page.status >= 400) {
    return {
      success: false,
      url: targetUrl,
      error: fetchError || `HTTP ${page?.status}`,
      gap_score: null,
      message: 'Could not fetch the page. Please verify the URL is publicly accessible.',
    };
  }

  const evidence = extractEvidence(page);
  const parsed = new url.URL(page.finalUrl || targetUrl);
  const hostname = parsed.hostname.replace(/^www\./, '');

  const detectedIndustry = options.industry || detectIndustry(page.body, hostname);
  const profile = profiles.find(p => p.industry === detectedIndustry) || null;

  const scoreResult = calcGapScore(evidence, profile);
  const gaps = buildGaps(evidence, profile);
  const quote = buildQuote(gaps, profile);

  return {
    success: true,
    url: page.finalUrl || targetUrl,
    domain: hostname,
    scanned_at: new Date().toISOString(),
    response_time_ms: page.responseTimeMs,

    detected_industry: detectedIndustry,
    industry_profile: profile ? {
      group: profile.group,
      industry: profile.industry,
      typical_budget_cad: profile.typical_budget_cad,
    } : null,

    gap_score: scoreResult.gap_score,
    present_score: scoreResult.present_score,
    gap_score_label: scoreLabel(scoreResult.gap_score),
    category_scores: scoreResult.categories,

    evidence,
    gaps_found: gaps,
    gaps_count: gaps.length,
    critical_gaps: gaps.filter(g => g.priority === 'CRITICAL').length,
    high_gaps: gaps.filter(g => g.priority === 'HIGH').length,

    recommendations: gaps.slice(0, 5).map(g => g.fix),
    agentforge_quote: quote,

    industry_benchmarks: profile ? profile.benchmarks : null,
    pain_points_industry: profile ? profile.top_pain_points.slice(0, 3) : [],
  };
}

function scoreLabel(score) {
  if (score >= 80) return 'CRITICAL — Major revenue leakage';
  if (score >= 60) return 'HIGH — Significant missed opportunity';
  if (score >= 40) return 'MEDIUM — Room to grow';
  if (score >= 20) return 'LOW — Mostly optimized';
  return 'EXCELLENT — Industry leader';
}

// ── Express Route Handler ───────────────────────────────────────────────────

function registerRoutes(app, limiter) {
  /**
   * POST /api/gap-scan
   * Body: { url: "https://example.com", industry?: "dental" }
   * Returns: full gap report + AgentForge quote
   */
  app.post('/api/gap-scan', limiter, async (req, res) => {
    const { url: targetUrl, industry } = req.body || {};
    if (!targetUrl) return res.status(400).json({ error: 'url is required' });

    try {
      const result = await scanUrl(targetUrl, { industry });
      res.json(result);
    } catch (err) {
      console.error('[gap-scan]', err.message);
      res.status(500).json({ error: 'Scan failed', message: err.message });
    }
  });

  /**
   * GET /api/gap-scan/industries
   * Returns list of supported industries + sub-industries
   */
  app.get('/api/gap-scan/industries', (req, res) => {
    const profiles = loadProfiles();
    res.json(profiles.map(p => ({
      id: p.industry,
      group: p.group,
      industry: p.industry,
      sub_industries: p.sub_industries,
    })));
  });

  /**
   * POST /api/gap-scan/batch
   * Body: { urls: ["url1","url2",...], industry?: "dental" }
   * Scans up to 5 URLs in parallel (for agency prospecting)
   */
  app.post('/api/gap-scan/batch', limiter, async (req, res) => {
    const { urls, industry } = req.body || {};
    if (!Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: 'urls array is required' });
    if (urls.length > 5) return res.status(400).json({ error: 'Max 5 URLs per batch' });

    const results = await Promise.allSettled(urls.map(u => scanUrl(u, { industry })));
    res.json(results.map((r, i) => r.status === 'fulfilled' ? r.value : { success: false, url: urls[i], error: r.reason?.message }));
  });
}

module.exports = { scanUrl, registerRoutes };
