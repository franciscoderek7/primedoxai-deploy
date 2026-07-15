/**
 * Agent Marketplace API
 * Handles agent listings, purchases, reviews, and creator submissions.
 * Revenue split: 70% creator / 20% platform / 10% operations
 */

const PLATFORM_FEE_PCT = 0.20;
const OPS_FEE_PCT = 0.10;
const CREATOR_PCT = 0.70;

// ── In-memory catalog (Supabase writes when available) ─────────────────────

const BUILT_IN_AGENTS = [
  {
    id: 'booking_agent',
    name: 'Booking Agent',
    tagline: 'End no-shows. Fill your calendar automatically.',
    description: 'AI-powered 24/7 appointment booking with SMS/email confirmations, reminder sequences, and cancellation handling. Integrates with Google Calendar, Calendly, and most booking platforms.',
    category: 'Customer Experience',
    industries: ['dental','medical_clinic','fitness','salon_beauty','legal_criminal','pet_services','childcare'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: true,
    setup_price_cad: 297,
    monthly_price_cad: 97,
    one_time: false,
    rating_avg: 4.9,
    review_count: 47,
    installs: 312,
    skills: ['appointment_booking','sms_reminders','calendar_sync','cancellation_handling','waitlist_management'],
    demo_url: 'https://primedoxaihq.com/demo/booking',
    manifest_version: '1.0',
    permissions: ['calendar:read','calendar:write','sms:send','email:send'],
    kpis: { no_show_reduction: '42%', booking_increase: '28%', setup_time_hours: 2 },
  },
  {
    id: 'chat_agent',
    name: 'Chat Agent',
    tagline: 'Never lose a lead to unanswered questions.',
    description: 'Trained on your business FAQs, services, and pricing. Qualifies leads, books appointments, escalates hot prospects. Works 24/7 across web, SMS, and WhatsApp.',
    category: 'Lead Capture',
    industries: ['all'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: true,
    setup_price_cad: 197,
    monthly_price_cad: 79,
    one_time: false,
    rating_avg: 4.8,
    review_count: 83,
    installs: 541,
    skills: ['faq_answering','lead_qualification','appointment_booking','escalation','multilingual'],
    demo_url: 'https://primedoxaihq.com/demo/chat',
    manifest_version: '1.0',
    permissions: ['chat:send','chat:receive','crm:write'],
    kpis: { lead_response_time: '<30s', qualification_rate: '68%', after_hours_capture: '34%' },
  },
  {
    id: 'review_agent',
    name: 'Review Agent',
    tagline: 'Turn happy customers into 5-star reviews — on autopilot.',
    description: 'Sends personalized review requests after service completion via SMS and email. Routes negative feedback internally before it hits Google. Monitors all review platforms.',
    category: 'Reputation',
    industries: ['dental','restaurant','fitness','salon_beauty','automotive_repair','cleaning','pet_services'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 197,
    monthly_price_cad: 69,
    one_time: false,
    rating_avg: 4.9,
    review_count: 61,
    installs: 289,
    skills: ['review_request','sentiment_routing','platform_monitoring','response_drafting'],
    demo_url: 'https://primedoxaihq.com/demo/review',
    manifest_version: '1.0',
    permissions: ['sms:send','email:send','google_business:read'],
    kpis: { review_volume_increase: '340%', response_rate: '28%', avg_rating_lift: '+0.6 stars' },
  },
  {
    id: 'seo_agent',
    name: 'SEO Agent',
    tagline: 'Rank higher. Get found first.',
    description: 'Audits and fixes on-page SEO: title tags, meta descriptions, OG tags, schema markup, sitemap generation, and page speed recommendations. Monthly reports with competitor gap analysis.',
    category: 'Marketing',
    industries: ['all'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 297,
    monthly_price_cad: 89,
    one_time: false,
    rating_avg: 4.7,
    review_count: 34,
    installs: 178,
    skills: ['on_page_audit','schema_markup','sitemap_gen','competitor_analysis','keyword_tracking'],
    demo_url: null,
    manifest_version: '1.0',
    permissions: ['website:read','sitemap:write'],
    kpis: { ranking_improvement: '3-8 positions', organic_traffic_increase: '45%', setup_time_hours: 4 },
  },
  {
    id: 'lead_agent',
    name: 'Lead Capture Agent',
    tagline: 'Stop losing the 97% who leave without converting.',
    description: 'Exit-intent popups, lead magnets, and drip email sequences. Connects to your CRM and email platform. A/B tests headlines and offers automatically.',
    category: 'Lead Capture',
    industries: ['all'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 197,
    monthly_price_cad: 79,
    one_time: false,
    rating_avg: 4.6,
    review_count: 28,
    installs: 143,
    skills: ['exit_intent','lead_magnets','drip_sequences','ab_testing','crm_sync'],
    demo_url: null,
    manifest_version: '1.0',
    permissions: ['email:send','crm:write','website:modify'],
    kpis: { list_growth_rate: '180%', conversion_lift: '12%', revenue_per_lead: '$340 avg' },
  },
  {
    id: 'intake_agent',
    name: 'Intake Agent',
    tagline: 'Replace your intake forms with a smart AI conversation.',
    description: 'Collects patient/client information via conversational AI before appointments. Pre-fills forms, verifies insurance, flags urgent cases. Saves 15 min per appointment.',
    category: 'Operations',
    industries: ['dental','medical_clinic','legal_criminal','childcare','financial_advisory'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 149,
    monthly_price_cad: 49,
    one_time: false,
    rating_avg: 4.8,
    review_count: 22,
    installs: 97,
    skills: ['data_collection','insurance_verification','form_autofill','case_triage'],
    demo_url: null,
    manifest_version: '1.0',
    permissions: ['sms:send','email:send','crm:write'],
    kpis: { admin_time_saved_min: 15, data_accuracy: '99.2%', patient_satisfaction: '+18%' },
  },
  {
    id: 'reminder_agent',
    name: 'Reminder Agent',
    tagline: 'Cut no-shows in half with smart reminder sequences.',
    description: 'Multi-touch reminder system: 48h, 24h, 2h before appointment. Allows one-tap confirm, reschedule, or cancel. Automatically fills cancellation slots from waitlist.',
    category: 'Operations',
    industries: ['dental','medical_clinic','fitness','salon_beauty','legal_criminal'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 149,
    monthly_price_cad: 49,
    one_time: false,
    rating_avg: 4.9,
    review_count: 56,
    installs: 267,
    skills: ['sms_reminders','email_reminders','reschedule_handling','waitlist_fill'],
    demo_url: null,
    manifest_version: '1.0',
    permissions: ['sms:send','email:send','calendar:read'],
    kpis: { no_show_reduction: '52%', reschedule_fill_rate: '78%', revenue_saved_per_month: '$1,200 avg' },
  },
  {
    id: 'follow_up_agent',
    name: 'Follow-Up Agent',
    tagline: 'Re-activate dormant customers without lifting a finger.',
    description: 'Identifies customers who haven\'t returned in X days and sends personalized re-engagement sequences. Includes special offers, treatment reminders, and referral requests.',
    category: 'Retention',
    industries: ['dental','medical_clinic','fitness','salon_beauty','restaurant','automotive_repair'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 149,
    monthly_price_cad: 59,
    one_time: false,
    rating_avg: 4.7,
    review_count: 19,
    installs: 88,
    skills: ['reactivation_sequences','referral_requests','offer_personalization','lapsed_detection'],
    demo_url: null,
    manifest_version: '1.0',
    permissions: ['sms:send','email:send','crm:read'],
    kpis: { reactivation_rate: '23%', referral_lift: '41%', ltv_increase: '18%' },
  },
  {
    id: 'analytics_agent',
    name: 'Analytics Agent',
    tagline: 'Know exactly what\'s making you money — and what\'s not.',
    description: 'GA4 setup, custom event tracking, conversion funnel analysis, and weekly performance reports. Plain-English insights, no spreadsheets required.',
    category: 'Intelligence',
    industries: ['all'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 149,
    monthly_price_cad: 49,
    one_time: false,
    rating_avg: 4.6,
    review_count: 31,
    installs: 156,
    skills: ['ga4_setup','event_tracking','funnel_analysis','weekly_reports','anomaly_detection'],
    demo_url: null,
    manifest_version: '1.0',
    permissions: ['analytics:read','analytics:write'],
    kpis: { setup_time_hours: 1, insights_per_week: 5, decision_speed_improvement: '60%' },
  },
  {
    id: 'social_agent',
    name: 'Social Media Agent',
    tagline: 'Consistent social presence without the daily grind.',
    description: 'Generates and schedules 30 days of posts from your services and brand voice. Monitors mentions, responds to comments, and surfaces trending topics in your niche.',
    category: 'Marketing',
    industries: ['restaurant','salon_beauty','fitness','real_estate','ecommerce','cleaning'],
    creator: 'Francisco Holdings Inc.',
    creator_id: 'fhi-official',
    verified: true,
    featured: false,
    setup_price_cad: 249,
    monthly_price_cad: 89,
    one_time: false,
    rating_avg: 4.5,
    review_count: 24,
    installs: 112,
    skills: ['content_generation','scheduling','mention_monitoring','comment_response','trend_analysis'],
    demo_url: null,
    manifest_version: '1.0',
    permissions: ['social:read','social:write'],
    kpis: { posts_per_month: 30, engagement_lift: '85%', time_saved_hours: 8 },
  },
];

// ── Supabase helpers ────────────────────────────────────────────────────────

async function getAgents(supa, filters = {}) {
  if (!supa) return { data: applyFilters(BUILT_IN_AGENTS, filters), source: 'catalog' };
  const q = supa.from('marketplace_agents').select('*').eq('status', 'active');
  if (filters.category) q.eq('category', filters.category);
  if (filters.industry) q.contains('industries', [filters.industry]);
  if (filters.featured) q.eq('featured', true);
  q.order('installs', { ascending: false });
  const { data, error } = await q;
  if (error) return { data: applyFilters(BUILT_IN_AGENTS, filters), source: 'catalog_fallback' };
  const merged = mergeWithCatalog(data);
  return { data: applyFilters(merged, filters), source: 'supabase' };
}

function applyFilters(agents, filters) {
  return agents.filter(a => {
    if (filters.category && a.category !== filters.category) return false;
    if (filters.industry && !a.industries.includes(filters.industry) && !a.industries.includes('all')) return false;
    if (filters.featured && !a.featured) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q);
    }
    return true;
  });
}

function mergeWithCatalog(dbAgents) {
  const dbIds = new Set(dbAgents.map(a => a.id));
  const missing = BUILT_IN_AGENTS.filter(a => !dbIds.has(a.id));
  return [...dbAgents, ...missing];
}

// ── Route Handlers ──────────────────────────────────────────────────────────

function registerRoutes(app, limiter, requireAuth, requireAdmin, supa) {
  /**
   * GET /api/marketplace/agents
   * Query: ?category=&industry=&featured=&search=&page=&per_page=
   */
  app.get('/api/marketplace/agents', limiter, async (req, res) => {
    const filters = {
      category: req.query.category || null,
      industry: req.query.industry || null,
      featured: req.query.featured === 'true',
      search: req.query.search || null,
    };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(50, parseInt(req.query.per_page) || 20);

    try {
      const { data, source } = await getAgents(supa, filters);
      const total = data.length;
      const paged = data.slice((page - 1) * perPage, page * perPage);
      res.json({ agents: paged, total, page, per_page: perPage, source });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch agents', message: err.message });
    }
  });

  /**
   * GET /api/marketplace/agents/:id
   */
  app.get('/api/marketplace/agents/:id', limiter, async (req, res) => {
    const { id } = req.params;
    let agent = BUILT_IN_AGENTS.find(a => a.id === id);

    if (!agent && supa) {
      const { data } = await supa.from('marketplace_agents').select('*').eq('id', id).single();
      agent = data;
    }

    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    let reviews = [];
    if (supa) {
      const { data } = await supa.from('agent_reviews')
        .select('rating,review_text,created_at,reviewer_name')
        .eq('agent_id', id).order('created_at', { ascending: false }).limit(10);
      reviews = data || [];
    }

    res.json({ ...agent, reviews });
  });

  /**
   * GET /api/marketplace/categories
   */
  app.get('/api/marketplace/categories', (req, res) => {
    const categories = [...new Set(BUILT_IN_AGENTS.map(a => a.category))].sort();
    res.json({ categories });
  });

  /**
   * POST /api/marketplace/agents/:id/purchase
   * Body: { customer_email, payment_method_id?, success_url? }
   * Creates Stripe Checkout session
   */
  app.post('/api/marketplace/agents/:id/purchase', limiter, async (req, res) => {
    const { id } = req.params;
    const agent = BUILT_IN_AGENTS.find(a => a.id === id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { customer_email, success_url, cancel_url } = req.body || {};

    // If Stripe is available, create a checkout session
    const stripe = req.app.get('stripe');
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: agent.one_time ? 'payment' : 'subscription',
          customer_email,
          line_items: [{
            price_data: {
              currency: 'cad',
              unit_amount: Math.round(agent.setup_price_cad * 100),
              product_data: { name: `${agent.name} — Setup`, description: agent.tagline },
              ...(agent.one_time ? {} : { recurring: { interval: 'month' } }),
            },
            quantity: 1,
          }],
          success_url: success_url || `https://primedoxaihq.com/marketplace/success?agent=${id}`,
          cancel_url: cancel_url || `https://primedoxaihq.com/marketplace/agents/${id}`,
          metadata: {
            agent_id: id,
            agent_name: agent.name,
            creator_id: agent.creator_id,
            platform_fee_pct: String(PLATFORM_FEE_PCT),
          },
        });
        return res.json({ checkout_url: session.url, session_id: session.id });
      } catch (err) {
        return res.status(500).json({ error: 'Stripe error', message: err.message });
      }
    }

    // Stripe not configured — return PayPal fallback
    res.json({
      checkout_url: `https://paypal.me/derekfranciaco1/${agent.setup_price_cad}CAD`,
      note: 'Stripe not configured — redirecting to PayPal. Include agent name in payment note.',
      agent_id: id,
      amount_cad: agent.setup_price_cad,
    });
  });

  /**
   * POST /api/marketplace/agents/:id/reviews
   * Body: { rating: 1-5, review_text, reviewer_name }
   * Requires auth
   */
  app.post('/api/marketplace/agents/:id/reviews', limiter, requireAuth, async (req, res) => {
    const { id } = req.params;
    const { rating, review_text, reviewer_name } = req.body || {};

    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });
    if (!review_text || review_text.trim().length < 10) return res.status(400).json({ error: 'review_text must be at least 10 chars' });

    if (!supa) return res.status(503).json({ error: 'Database not connected' });

    const { data, error } = await supa.from('agent_reviews').insert({
      agent_id: id,
      user_id: req.user.sub,
      rating,
      review_text: review_text.trim(),
      reviewer_name: reviewer_name || 'Anonymous',
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });

    // Update aggregate rating on the agent record
    const { data: allReviews } = await supa.from('agent_reviews').select('rating').eq('agent_id', id);
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await supa.from('marketplace_agents').update({
        rating_avg: Math.round(avg * 10) / 10,
        review_count: allReviews.length,
      }).eq('id', id);
    }

    res.json({ success: true, review: data });
  });

  /**
   * POST /api/marketplace/submit
   * Submit a new agent to the marketplace (creator flow)
   * Body: { name, tagline, description, category, industries[], setup_price_cad, monthly_price_cad, skills[], permissions[] }
   */
  app.post('/api/marketplace/submit', limiter, requireAuth, async (req, res) => {
    const required = ['name', 'tagline', 'description', 'category', 'setup_price_cad'];
    const missing = required.filter(k => !req.body?.[k]);
    if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

    const submission = {
      ...req.body,
      creator_id: req.user.sub,
      creator_email: req.user.email,
      status: 'pending_review',
      verified: false,
      featured: false,
      rating_avg: 0,
      review_count: 0,
      installs: 0,
      manifest_version: '1.0',
      submitted_at: new Date().toISOString(),
    };

    if (!supa) {
      return res.json({
        success: true,
        message: 'Submission received (queued — database not connected). Email primedoxaihq.com to confirm.',
        submission_id: `sub_${Date.now()}`,
      });
    }

    const { data, error } = await supa.from('marketplace_agents').insert(submission).select().single();
    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, message: 'Agent submitted for review. We\'ll contact you within 48 hours.', agent_id: data.id });
  });

  /**
   * GET /api/marketplace/stats
   * Admin-only: marketplace revenue summary
   */
  app.get('/api/marketplace/stats', requireAdmin, async (req, res) => {
    if (!supa) return res.json({ total_agents: BUILT_IN_AGENTS.length, source: 'catalog', gmv_cad: null });

    const [agentsRes, purchasesRes] = await Promise.all([
      supa.from('marketplace_agents').select('id', { count: 'exact' }),
      supa.from('agent_purchases').select('amount_cad,creator_pct').eq('status', 'completed'),
    ]);

    const purchases = purchasesRes.data || [];
    const gmv = purchases.reduce((s, p) => s + (p.amount_cad || 0), 0);
    const platform_rev = gmv * PLATFORM_FEE_PCT;
    const ops_rev = gmv * OPS_FEE_PCT;

    res.json({
      total_agents: agentsRes.count || BUILT_IN_AGENTS.length,
      total_purchases: purchases.length,
      gmv_cad: Math.round(gmv * 100) / 100,
      platform_revenue_cad: Math.round(platform_rev * 100) / 100,
      ops_revenue_cad: Math.round(ops_rev * 100) / 100,
      creator_payouts_cad: Math.round((gmv - platform_rev - ops_rev) * 100) / 100,
      revenue_split: { creator: CREATOR_PCT, platform: PLATFORM_FEE_PCT, ops: OPS_FEE_PCT },
    });
  });
}

module.exports = { registerRoutes, BUILT_IN_AGENTS };
