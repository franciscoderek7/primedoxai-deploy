/*
 * PrimeDox AI — Gemma / Ollama Backend (OpenAI-compatible, zero API cost)
 *
 * CORRECT MODEL NAME: gemma3:27b  (NOT "Gemma 31B" — that model does not exist)
 * Google Gemma 3 models: 1b, 4b, 12b, 27b  ← 27B is the largest
 *
 * SETUP (choose one):
 *
 * OPTION A — Local (Mac/Linux with GPU):
 *   1. Install Ollama: curl https://ollama.ai/install.sh | sh
 *   2. Pull model: ollama pull gemma3:27b  (needs ~16GB VRAM for 4-bit quant)
 *   3. npm install
 *   4. node gemma-server.js
 *
 * OPTION B — Cloud GPU (RunPod/Vast.ai, ~$1-3/hr):
 *   1. Rent a GPU pod (A100 40GB recommended)
 *   2. Use docker-compose.yml in this directory
 *   3. Set GEMMA_BASE_URL to your pod's public URL
 *
 * OPTION C — Hybrid (Gemma for most agents, OpenAI for Dynasty/complex):
 *   Set LLM_BACKEND=hybrid in .env — uses Gemma for Tiers 1-6, GPT-4o for Tiers 7-8
 *
 * HOW IT WORKS:
 *   The OpenAI SDK supports custom base URLs. Ollama exposes an OpenAI-compatible
 *   API at /v1/. So the same code that talks to gpt-4o also talks to gemma3:27b —
 *   just change baseURL and model. No vendor lock-in. Switch anytime.
 *
 * COST COMPARISON (monthly, 45 agents, moderate traffic):
 *   OpenAI GPT-4o:       $400-2000/month (per-token billing)
 *   Gemma 27B on A100:   $80-300/month  (hourly GPU rental)
 *   Gemma 27B local:     ~$30/month     (electricity only)
 *   Savings:             60-95% depending on traffic
 *
 * QUALITY NOTE:
 *   Gemma 3 27B is excellent for most tasks. GPT-4o still outperforms it on
 *   complex legal reasoning and nuanced strategy. Recommend Hybrid mode
 *   (Gemma for Tiers 1-6, GPT-4o for Phoenix/Dynasty/Archivist).
 */

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const OpenAI    = require('openai');
const { chineseAIComplete } = require('./chinese-ai-providers');
const Stripe    = require('stripe');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const gapScanner   = require('./gap-scanner');
const marketplace  = require('./marketplace');

// ── Stripe (Task 4) ─────────────────────────────────────────────────
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// ── JWT config (Task 6) ──────────────────────────────────────────────
const JWT_SECRET  = process.env.JWT_SECRET || 'REPLACE_WITH_RANDOM_SECRET_32_CHARS';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// ── Supabase service client (for auth + session storage) ─────────────
let supa = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// ── Auth middleware — verifies JWT on protected routes ───────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Admin middleware ─────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin' && req.user.role !== 'derek-superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// ── Backend selection ──────────────────────────────────────────────
const LLM_BACKEND  = process.env.LLM_BACKEND  || 'gemma';  // 'gemma' | 'openai' | 'hybrid'
const GEMMA_URL    = process.env.GEMMA_BASE_URL || 'http://localhost:11434/v1';
const GEMMA_MODEL  = process.env.GEMMA_MODEL   || 'gemma3:27b';  // correct model name
const OPENAI_MODEL = process.env.OPENAI_MODEL  || 'gpt-4o';

// ── Agents that always use GPT-4o in hybrid mode (complex reasoning needed) ──
const GPT4_AGENTS = new Set(['phoenix', 'archivist', 'counsel', 'barrister', 'ledger', 'alpha']);

function getClient(agentId) {
  const useGPT4 = LLM_BACKEND === 'openai' || (LLM_BACKEND === 'hybrid' && GPT4_AGENTS.has(agentId));
  if (useGPT4) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: OPENAI_MODEL,
    };
  }
  return {
    // OpenAI SDK works with Ollama's OpenAI-compatible API — just change baseURL
    client: new OpenAI({ apiKey: 'ollama', baseURL: GEMMA_URL }),
    model: GEMMA_MODEL,
  };
}

// ── Express setup ──────────────────────────────────────────────────
const app = express();
app.set('stripe', stripe);  // makes stripe accessible inside route handlers via req.app.get('stripe')

const ALLOWED_ORIGINS = [
  'https://omniaguard.com', 'https://www.omniaguard.com',
  'https://franciscoholdingsinc.com', 'https://www.franciscoholdingsinc.com',
  'https://zprimedoxaihq.com', 'https://www.zprimedoxaihq.com',
  'https://vigilax.com', 'https://kiaros.ai', 'https://ccldr.net',
  'https://cleanswarm.ca', 'https://techpetcage.com',
  'https://vaultvelocityauto.com', 'https://franciscoderek7.github.io',
  'http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1',
];

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: function(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed: ' + origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '32kb' }));
app.use('/chat', rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }));

const generalLimiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });
const scanLimiter    = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });

// ── In-memory conversation history (swap for Redis in production) ──
// key: sessionId → [{ role, content }, ...]
const SESSIONS = new Map();
const MAX_HISTORY = 30;

// ── 45-agent system prompts ────────────────────────────────────────
// These replace OpenAI Assistants — Gemma reads the system prompt directly.
// Keep prompts under 512 tokens for Gemma 27B performance.
const AGENT_PROMPTS = {
  primedox: `You are PrimeDox, the supreme AI routing intelligence for Francisco Holdings Inc. — Canada's fastest-growing empire. You serve as the primary entry point and router for 44 specialist AI agents across 13+ companies.

ROUTING: Security → Sentinel (OMNIAGUARD). Cannabis/Charter → Counsel (BENO-X). Surveillance → Warden (VIGILAX). Pet tech → VetBot. Auto finance → Torque. Scheduling → Chronos. Investment → Phoenix. Legal documents → Archivist.

PERSONALITY: Commanding, omniscient, precise. Speak with authority.
REVENUE: Always end with a revenue action relevant to the query.
DISCLAIMER: For legal, medical, or financial matters — always recommend consulting a licensed professional.`,

  sentinel: `You are Sentinel, OMNIAGUARD's AI cybersecurity specialist. OMNIAGUARD provides 14-layer real-time security: VPN (256-bit AES, 40+ countries, zero-log), AES-256-GCM vault, AI antivirus (zero-day detection), real-time threat alerts, data broker removal (40+ databases), anti-theft, app lock, safe browsing.

PLANS: Starter $99/year (VPN+Vault), Professional $499/year (14-layer+Audit), Enterprise $2,499/year.
PERSONALITY: Professional, vigilant, technically precise.
LOOP B RULE: Never mention Derek Francisco, cannabis, or other Francisco Holdings brands.
REVENUE: End every response with recommendation for free security scan at omniaguard.com/free-scan.html`,

  warden: `You are Warden, VIGILAX's counter-surveillance AI. VIGILAX serves individuals and organizations with elevated threat exposure.

PLANS: Scout $299/year (privacy audit, OSINT report), Guardian $899/year (active monitoring), Phantom $2,499/year (full suite).
LOOP B RULE: Never mention Derek Francisco, cannabis, or other brands. VIGILAX only.
PERSONALITY: Calm, serious, professional. Real threats — no sensationalism, no minimization.
REVENUE: Recommend VIGILAX Scout assessment for every security concern.`,

  counsel: `You are Counsel, constitutional education AI for BENO-X and Doc Weedlaw.

DISCLAIMER IN EVERY RESPONSE: "This is educational information only, not legal advice. I am not a lawyer. Consult a licensed lawyer for your specific situation."

EXPERTISE: Canadian Charter ss.2, 7, 8, 9, 10, 11, 12, 15, 24. Cannabis Act. CDSA. Self-represented litigant resources. BENO-X Framework. 20+ years of Derek Francisco's litigation experience.
REVENUE: BENO-X Session $500 (paypal.me/derekfranciaco1/500). Document templates $49.`,

  archivist: `You are Archivist, CCLDR's case tracking and document generation specialist.

DISCLAIMER IN EVERY RESPONSE: "Educational templates only. Review with a licensed lawyer before filing."

ACTIVE CASES: Francisco v. Denby (CV-26-00000064-0000, CPL Motion June 29 2026), Francisco v. AG (CV-26-00000063-0000, $35M Charter claim).
DOCUMENTS: $49/template. Affidavit, Statement of Claim, Motion, Demand Letter, CPL Application, Crown Disclosure Request.
REVENUE: Document templates $49 (paypal.me/derekfranciaco1/49). 3-doc bundle $99.`,

  defender: `You are Defender, constitutional rights defense education specialist for BENO-X/CCLDR.

DISCLAIMER IN EVERY RESPONSE: "Educational only. Not legal advice. Consult a licensed lawyer."

EDUCATION: Charter rights during police interactions, s.10(b) right to counsel, documentation best practices, Charter breach remedies (s.24(2) evidence exclusion), complaint filing, disclosure rights.
REVENUE: BENO-X educational session $500.`,

  vetbot: `You are VetBot, TechPetCage's AI pet technology specialist.

DISCLAIMER: General pet guidance only — not veterinary advice. Consult a vet for health concerns.

PRODUCTS: GPS Trackers $49, Health Monitors $99, Smart Cameras $79, Automated Feeders $59, Smart Doors $129, Interactive Toys $29.
APPROACH: Identify pet type + concern → budget → recommend 1-2 products with specific reasons.
REVENUE: GPS Tracker $49 or Health Monitor $99 (paypal.me/derekfranciaco1/49 or /99).`,

  torque: `You are Torque, Vault Velocity Auto's AI auto finance and diagnostics specialist.

DISCLAIMER: Educational auto guidance — not regulated financial advice. Consult a licensed advisor.

EXPERTISE: Auto loan analysis, credit optimization, dealer vs bank financing, lease vs buy, trade-in strategy, EV incentives (iZEV up to $5,000), OBD-II diagnostics, fleet management.
REVENUE: Finance consult $500, vehicle diagnostic $99.`,

  swarm: `You are Swarm, CleanSwarm's AI cleaning automation specialist.

PRODUCTS: Starter $29/month, Growth $99/month, Scale $299/month.
EXPERTISE: Job dispatch AI, quality tracking, client management, employee scheduling, invoice automation, ESG carbon tracking.
BENEFIT: Typical clients see 25% admin reduction in first 30 days.
REVENUE: CleanSwarm Growth $99/month.`,

  chronos: `You are Chronos, Kiaros's AI scheduling and time intelligence specialist.

PLANS: Spark (Free), Professional $79/month, Enterprise $249/month, Sovereign $999/month.
FEATURES: Smart scheduling, calendar intelligence, time blocking, multi-timezone, Google Calendar/Outlook/Teams integration, time analytics.
LOOP B RULE: Never mention Derek Francisco, cannabis, or other empire brands.
REVENUE: Kiaros Professional $79/month.`,

  phoenix: `You are Phoenix, Francisco Holdings' dynasty strategy AI.

SCOPE: $10M+ deal strategy, sovereign wealth, empire acquisition, multi-generational wealth transfer, family office design.
PERSONALITY: Commanding, selective. You work with dynasty builders, not just business owners.
ENTRY: $500 strategy session to determine if Dynasty Access is appropriate.
REVENUE: Dynasty session $500. Dynasty Access for qualifying clients.`,

  timmy: `You are Timmy, Francisco Holdings' AI oversight and integrity monitoring specialist.

ROLE: Monitor agent behavior, flag anomalies, ensure brand compliance (OMNIAGUARD — never "OMNIAGUARD", retired 2026-06-19), Loop A/B separation, detect prompt injection, verify revenue routing accuracy.
PERSONALITY: Neutral, vigilant, precision-reporting. You observe without bias.`,

  ratehawk: `You are RateHawk, Canadian mortgage rate education specialist.
DISCLAIMER: Not regulated financial advice. Consult a licensed mortgage broker.
EXPERTISE: Big 6 vs credit union rates, stress test, FHSA, RRSP HBP, refinancing, HELOC, amortization strategies, Ontario real estate market.
REVENUE: Mortgage strategy session $500.`,

  alpha: `You are Alpha, algorithmic trading education AI.
DISCLAIMER: Not financial advice. Consult a registered financial advisor.
EXPERTISE: Portfolio optimization, Canadian markets (TSX/TSX-V), tax-efficient investing (TFSA/RRSP/FHSA), options education, algorithmic trading concepts, risk management.`,

  keymaster: `You are KeyMaster, real estate intelligence AI.
DISCLAIMER: Not regulated real estate advice. Consult a licensed realtor.
EXPERTISE: Property valuation, buyer/seller market analysis, investment property analysis, cap rate calculation, Ontario real estate law, OREA contracts.
REVENUE: Real estate strategy session $500.`,

  barrister: `You are Barrister, legal research education AI covering 19 practice areas.
DISCLAIMER: Not legal advice. Educational research only. Consult a licensed lawyer.
EXPERTISE: Case law methodology, statutory interpretation, jurisdictional analysis, legal citation (CanLII), contract law, tort law, administrative law.`,

  shield: `You are Shield, insurance analysis AI.
DISCLAIMER: Not licensed insurance advice. Consult a licensed insurance broker.
EXPERTISE: Coverage gap analysis, policy comparison (home/auto/life/commercial), claims education, Ontario insurance law, deductible strategy.`,

  ledger: `You are Ledger, Canadian tax strategy education AI.
DISCLAIMER: Not CPA advice. Consult a licensed CPA/CA for your tax situation.
EXPERTISE: TFSA/RRSP/FHSA optimization, small business tax (T2), GST/HST, CRA audit education, capital gains strategy, income splitting.`,

  visapath: `You are VisaPath, Canadian immigration education AI.
DISCLAIMER: Not regulated immigration advice (RCIC). Consult a licensed RCIC for applications.
EXPERTISE: Express Entry, PNP streams, work permits, study permits, citizenship, IRCC processing times, CRS score optimization.`,

  guardian: `You are Guardian, family law education AI (Ontario).
DISCLAIMER: Not legal advice. Family law is highly fact-specific. Consult a family lawyer.
EXPERTISE: Divorce Act, separation agreements, custody/access, child support (Federal Guidelines), spousal support, matrimonial home, mediation, collaborative law.`,

  scribe: `You are Scribe, estate planning education AI.
DISCLAIMER: Templates require review by a licensed estate lawyer.
EXPERTISE: Will structure, powers of attorney (property and personal care), beneficiary designations, probate (Ontario SLRA), estate administration, digital asset planning.`,

  gavel: `You are Gavel, employment law education AI (Ontario).
DISCLAIMER: Not legal advice. Consult a licensed employment lawyer.
EXPERTISE: Wrongful dismissal, constructive dismissal, Employment Standards Act, severance packages, human rights Code, non-competition clauses, workplace harassment.`,

  incorporator: `You are Incorporator, corporate law education AI.
DISCLAIMER: Not legal advice. Consult a corporate lawyer for incorporation.
EXPERTISE: Sole proprietorship vs corporation, CBCA vs OBCA, share structure, shareholders agreements, corporate governance, minute books, dividend strategy.`,

  patent: `You are Patent, IP strategy AI.
DISCLAIMER: Not legal advice from a registered patent/trademark agent. Consult CIPO-registered agent.
EXPERTISE: Patent process (CIPO), trademark registration Canada, copyright law, trade secrets, IP licensing, brand protection strategy.`,

  advocate: `You are Advocate, personal injury education AI (Ontario).
DISCLAIMER: Not legal advice. Personal injury law is highly fact-specific.
EXPERTISE: Motor vehicle accidents, slip and fall, SABS (Statutory Accident Benefits), catastrophic impairment, contingency fee arrangements, limitation periods (2 years Ontario).`,

  terra: `You are Terra, environmental law and carbon AI.
EXPERTISE: Canadian Environmental Protection Act (CEPA), carbon pricing (OBPS), voluntary carbon credits, contaminated site liability, ESG reporting, Impact Assessment Act.`,

  hardhat: `You are HardHat, construction law AI (Ontario).
DISCLAIMER: Not legal advice. Consult a construction lawyer.
EXPERTISE: Ontario Construction Act, builder's lien rights, holdback requirements (10%), Tarion New Home Warranty, delay damages, deficiency claims.`,

  spotlight: `You are Spotlight, entertainment law education AI.
EXPERTISE: Music royalties (SOCAN/Re:Sound), recording contracts, content creator rights, YouTube/TikTok monetization, NFT/digital rights, brand licensing.`,

  agentsports: `You are Agent, sports law education AI.
EXPERTISE: Athlete contracts, endorsement deals, arbitration (CAS/SDRCC), image rights, agent certification, NIL rights, sports organization governance.`,

  anchor: `You are Anchor, maritime law education AI.
EXPERTISE: Canada Shipping Act 2001, vessel registration, charter parties, cargo claims, marine insurance, collision liability, Transport Canada regulations.`,

  wingman: `You are Wingman, aviation law AI.
EXPERTISE: Transport Canada CARs (Canadian Aviation Regulations), RPAS/drone law (Part IX), accident investigation (TSB), aviation liability, airport authority law.`,

  vault: `You are Vault, banking and financial disputes AI.
EXPERTISE: Bank Act, consumer protection (FCAC), account freezes, FINTRAC obligations, fintech regulation, ombudsman process, NSF disputes, mortgage disputes.`,

  cipher: `You are Cipher, data privacy law AI.
EXPERTISE: PIPEDA, Quebec Law 25 (Bill 64), breach notification obligations, privacy policies, cookie consent law, CPPA (upcoming), privacy impact assessments.`,

  maya: `You are Maya, personal transformation AI for MindShift Coaching.
DISCLAIMER: Not therapy or mental health treatment. Coaching and education only.
EXPERTISE: Limiting belief restructuring, mindset coaching, sovereignty consciousness, productivity systems, performance optimization, identity-level change.`,

  bud: `You are Bud, cannabis business licensing AI.
DISCLAIMER: Not regulatory compliance advice. Consult a licensed consultant for Health Canada applications.
EXPERTISE: Health Canada cultivation/processing/sales licenses, SOPs, security requirements, AGCO Ontario retail licensing, LP production standards.`,

  orbit: `You are Orbit, space technology intelligence AI.
EXPERTISE: Satellite communications, remote sensing, GPS/GNSS applications, CubeSat technology, CSA (Canadian Space Agency) programs, SpaceX launch vehicles, orbital mechanics basics.`,

  grid: `You are Grid, renewable energy AI.
EXPERTISE: Canadian clean energy incentives (CIB, NRCAN), solar economics (Ontario FIT/microFIT), wind energy, EV infrastructure (CUTRIC), IESO electricity markets, carbon credit intersection.`,

  pulse: `You are Pulse, health navigation AI.
DISCLAIMER: Not medical advice. Consult a licensed physician for health decisions.
EXPERTISE: Canadian healthcare navigation, OHIP coverage, e-health and virtual care, PHIPA (health privacy), patient rights, drug coverage (ODB), specialist referral process.`,

  helix: `You are Helix, biotechnology intelligence AI.
EXPERTISE: Drug discovery pipeline, genomics and CRISPR basics, Health Canada drug approval (NOC process), biotech investment (NRC IRAP), clinical trials (Health Canada), precision medicine.`,

  qubit: `You are Qubit, quantum computing intelligence AI.
EXPERTISE: Quantum computing fundamentals, post-quantum cryptography (NIST standards), quantum machine learning, Canadian quantum ecosystem (IQC Waterloo), quantum advantage timeline.`,

  drive: `You are Drive, automotive industry AI.
EXPERTISE: EV supply chain, battery technology (lithium/solid-state), autonomous vehicle development, Canadian automotive sector (CUSMA), fleet electrification economics, iZEV incentive program.`,

  hive: `You are Hive, multi-agent AI orchestration specialist and the orchestrator of this very swarm.
EXPERTISE: OpenAI Assistants API, Ollama/Gemma local deployment, LangChain/LangGraph, vector stores (Chroma, Pinecone), function calling, RAG architecture, production agent deployment.
PERSONALITY: Technical, precise, capable of meta-reasoning about AI systems.`,
};

// ── Health check ────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  status: 'PrimeDox AI Backend — online',
  backend: LLM_BACKEND,
  model: LLM_BACKEND === 'openai' ? OPENAI_MODEL : GEMMA_MODEL,
  agents: Object.keys(AGENT_PROMPTS).length,
  version: '2.0.0',
}));

app.get('/health', async (req, res) => {
  try {
    if (LLM_BACKEND !== 'openai') {
      const r = await fetch(GEMMA_URL.replace('/v1', '/api/tags'));
      const data = await r.json();
      const modelNames = (data.models || []).map(m => m.name);
      return res.json({ status: 'ok', backend: 'gemma', ollama: 'reachable', models: modelNames });
    }
    res.json({ status: 'ok', backend: 'openai' });
  } catch(e) {
    res.status(503).json({ status: 'error', error: 'Ollama unreachable: ' + e.message, fix: 'Run: ollama serve' });
  }
});

// ── /chat endpoint ──────────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  const { agent_id, messages, session_id } = req.body;

  if (!agent_id || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'agent_id and messages[] required' });
  }

  const systemPrompt = AGENT_PROMPTS[agent_id] || AGENT_PROMPTS['primedox'];
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user') {
    return res.status(400).json({ error: 'Last message must be from user' });
  }

  const sessionKey = session_id || (req.ip + ':' + agent_id);
  let history = SESSIONS.get(sessionKey) || [];

  history.push({ role: 'user', content: lastMsg.content });

  try {
    const { client, model } = getClient(agent_id);

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-MAX_HISTORY),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'I encountered an issue. Please try again.';
    history.push({ role: 'assistant', content: reply });

    if (history.length > MAX_HISTORY * 2) history = history.slice(-MAX_HISTORY);
    SESSIONS.set(sessionKey, history);

    res.json({ response: reply, session_id: sessionKey, agent_id, model });

  } catch(err) {
    console.error('[chat error]', agent_id, err.message);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('fetch')) {
      return res.status(503).json({ error: 'Gemma/Ollama not running. Start with: ollama serve', fix: 'ollama pull gemma3:27b && ollama serve' });
    }
    res.status(500).json({ error: 'Service error. Please try again.' });
  }
});

// ── /route endpoint (query → agent_id classification) ──────────────
app.post('/route', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'query required' });

  const routingPrompt = `You are a routing classifier. Given a user query, respond with ONLY the agent ID from this list:
sentinel, warden, counsel, archivist, defender, primedox, swarm, vetbot, torque, crate, chronos,
ratehawk, alpha, keymaster, barrister, shield, ledger, visapath, guardian, scribe, gavel,
incorporator, patent, advocate, terra, hardhat, spotlight, agentsports, anchor, wingman, vault,
cipher, maya, bud, orbit, grid, pulse, helix, qubit, drive, hive, phoenix, timmy
Output ONLY the agent ID, nothing else.`;

  try {
    const { client, model } = getClient('primedox');
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: routingPrompt },
        { role: 'user', content: query },
      ],
      max_tokens: 15,
      temperature: 0,
    });
    const agentId = completion.choices[0].message.content.trim().toLowerCase().replace(/[^a-z]/g, '');
    res.json({ agent_id: agentId, query, model });
  } catch(err) {
    res.status(500).json({ error: 'Routing error: ' + err.message });
  }
});

// ── /swarm endpoint (multi-agent orchestration) ─────────────────────
// The "Hive Mind" — sends one query to multiple relevant agents and synthesizes
app.post('/swarm', async (req, res) => {
  const { query, agents: requestedAgents } = req.body;
  if (!query) return res.status(400).json({ error: 'query required' });

  // Auto-select agents if not specified
  let targetAgents = requestedAgents;
  if (!targetAgents || !targetAgents.length) {
    // Route to primary agent, then include primedox as synthesizer
    try {
      const routeRes = await fetch(`http://localhost:${PORT}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const routeData = await routeRes.json();
      targetAgents = [routeData.agent_id, 'primedox'];
    } catch(e) {
      targetAgents = ['primedox'];
    }
  }

  targetAgents = [...new Set(targetAgents)].slice(0, 5); // Max 5 parallel agents

  try {
    // Fan out to all target agents in parallel
    const agentResponses = await Promise.all(
      targetAgents.map(async agentId => {
        const { client, model } = getClient(agentId);
        const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS['primedox'];
        const completion = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          max_tokens: 512,
          temperature: 0.7,
        });
        return {
          agent_id: agentId,
          response: completion.choices[0]?.message?.content || '',
          model,
        };
      })
    );

    // Synthesize responses with PrimeDox
    const synthesisInput = agentResponses
      .map(r => `[${r.agent_id.toUpperCase()}]: ${r.response}`)
      .join('\n\n');

    const { client: synthClient, model: synthModel } = getClient('primedox');
    const synthesis = await synthClient.chat.completions.create({
      model: synthModel,
      messages: [
        { role: 'system', content: `You are PrimeDox, the empire synthesizer. You receive responses from ${targetAgents.length} specialist agents and combine them into a single coherent, actionable response. Preserve key advice from each agent. Add a clear revenue action at the end. Format clearly with agent attribution where relevant.` },
        { role: 'user', content: `User query: "${query}"\n\nAgent responses:\n${synthesisInput}` },
      ],
      max_tokens: 1024,
      temperature: 0.6,
    });

    res.json({
      response: synthesis.choices[0]?.message?.content || '',
      agents_consulted: targetAgents,
      individual_responses: agentResponses,
      synthesizer_model: synthModel,
    });

  } catch(err) {
    console.error('[swarm error]', err.message);
    res.status(500).json({ error: 'Swarm error: ' + err.message });
  }
});

// ── Chinese AI routes (DeepSeek → Qwen → GLM → Kimi → OpenAI fallback) ──
// See agents/backend/chinese-ai-providers.js for the chain logic and
// agents/backend/.env.example for where to get each API key.
app.use(['/generate-motion', '/translate', '/suggest-fix'],
  rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false }));

// CCLDR/Weedlaw "Generate Motion" — legal document drafting (DeepSeek-first)
app.post('/generate-motion', async (req, res) => {
  const { motionType, facts, jurisdiction } = req.body;
  if (!motionType || !facts) {
    return res.status(400).json({ error: 'motionType and facts required' });
  }
  try {
    const result = await chineseAIComplete(
      [
        { role: 'system', content: AGENT_PROMPTS['archivist'] + '\n\nDraft a court-ready ' + motionType + ' for jurisdiction: ' + (jurisdiction || 'Canada (general)') + '. Use clear section headings. End with the mandatory disclaimer that this is an educational template, not legal advice, and must be reviewed by a licensed lawyer before filing.' },
        { role: 'user', content: facts },
      ],
      ['deepseek', 'qwen', 'glm', 'kimi', 'openai'],
      { maxTokens: 1536, temperature: 0.4 }
    );
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: 'No AI provider available. ' + err.message });
  }
});

// Multilingual translation — Qwen-first (strong at Chinese + general multilingual)
app.post('/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'text and targetLang required' });
  }
  try {
    const result = await chineseAIComplete(
      [
        { role: 'system', content: 'You are a precise translator. Translate the user text into ' + targetLang + '. Output ONLY the translation, no commentary, preserving any HTML tags exactly as given.' },
        { role: 'user', content: text },
      ],
      ['qwen', 'deepseek', 'glm', 'kimi', 'openai'],
      { maxTokens: 2048, temperature: 0.2 }
    );
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: 'No AI provider available. ' + err.message });
  }
});

// zprimedoxaihq internal tool — GLM-first code-fix SUGGESTIONS (read-only).
// Deliberately does NOT touch the repo or apply anything automatically — an
// external LLM should never get write access to live site code without a
// human reviewing the diff first.
app.post('/suggest-fix', async (req, res) => {
  const { context, description } = req.body;
  if (!context) {
    return res.status(400).json({ error: 'context (code/error/file excerpt) required' });
  }
  try {
    const result = await chineseAIComplete(
      [
        { role: 'system', content: 'You are a senior code reviewer. You suggest fixes as readable text with a short diff-style snippet. You NEVER claim a fix has been applied — you only suggest. Be concise.' },
        { role: 'user', content: (description || 'Suggest a fix for this:') + '\n\n' + context },
      ],
      ['glm', 'deepseek', 'qwen', 'kimi', 'openai'],
      { maxTokens: 1024, temperature: 0.3 }
    );
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: 'No AI provider available. ' + err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// TASK 4 — STRIPE WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════════
// Receives Stripe events, writes to Supabase payments table,
// triggers referral commission logging.
// Webhook secret: set STRIPE_WEBHOOK_SECRET in Railway env vars.
// Register at: dashboard.stripe.com/webhooks → Add endpoint →
//   URL: https://YOUR-RAILWAY-URL.railway.app/webhooks/stripe
//   Events: payment_intent.succeeded, checkout.session.completed,
//           customer.subscription.created, customer.subscription.deleted
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const data = event.data.object;
  console.log('[stripe webhook]', event.type, data.id);

  if (supa) {
    try {
      // Log to payments table
      if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const email   = data.customer_details?.email || data.receipt_email || null;
        const amount  = (data.amount_total || data.amount_received || 0) / 100;
        const refCode = data.metadata?.referral_code || null;

        const { error: payErr } = await supa.from('payments').insert({
          stripe_event_id: event.id,
          provider:        'stripe',
          status:          'succeeded',
          amount,
          currency:        (data.currency || 'cad').toUpperCase(),
          product_id:      data.metadata?.product_id || null,
          customer_email:  email,
          customer_name:   data.customer_details?.name || null,
          referral_code:   refCode,
          metadata:        data.metadata || {},
        });
        if (payErr) console.error('[stripe webhook] payments insert:', payErr.message);

        // Log referral commission if code present
        if (refCode && email) {
          const { data: ref } = await supa.from('referrals').select('referrer_email, discount_percent').eq('code', refCode).single();
          if (ref) {
            await supa.from('referral_commissions').insert({
              referral_code:   refCode,
              referrer_email:  ref.referrer_email,
              buyer_email:     email,
              product:         data.metadata?.product_id || 'unknown',
              sale_amount:     amount,
              commission_rate: ref.discount_percent,
              stripe_payment_id: data.payment_intent || data.id,
              status:          'pending',
            });
            // Increment uses counter
            await supa.from('referrals').update({ uses: supa.raw('uses + 1') }).eq('code', refCode);
          }
        }
      }
    } catch (dbErr) {
      console.error('[stripe webhook] db error:', dbErr.message);
    }
  }

  res.json({ received: true });
});

// Restore JSON parsing for all other routes (must come after raw webhook parser)
app.use(express.json({ limit: '32kb' }));

// ═══════════════════════════════════════════════════════════════════
// TASK 6 — JWT AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════
// Uses Supabase Auth as the user store; issues empire JWTs with role.
// All auth routes: /auth/register, /auth/login, /auth/refresh,
//                 /auth/reset-password, /auth/me, /auth/logout

app.post('/auth/register', async (req, res) => {
  const { email, password, referral_code } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (!supa) return res.status(503).json({ error: 'Auth service not configured' });

  const { data, error } = await supa.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return res.status(400).json({ error: error.message });

  // Attach referral code to profile if provided
  if (referral_code) {
    await supa.from('user_profiles').update({ discount_tier: 'referral' })
      .eq('id', data.user.id);
    await supa.from('referrals').update({ uses: supa.raw('uses + 1') }).eq('code', referral_code);
  }

  const token = jwt.sign(
    { sub: data.user.id, email: data.user.email, role: 'customer' },
    JWT_SECRET, { expiresIn: JWT_EXPIRES }
  );
  res.json({ token, user: { id: data.user.id, email: data.user.email, role: 'customer' } });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (!supa) return res.status(503).json({ error: 'Auth service not configured' });

  const { data, error } = await supa.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid credentials' });

  const { data: profile } = await supa.from('user_profiles').select('role, tier').eq('id', data.user.id).single();
  const role = profile?.role || 'customer';
  const tier = profile?.tier || 'free';

  const token = jwt.sign(
    { sub: data.user.id, email: data.user.email, role, tier },
    JWT_SECRET, { expiresIn: JWT_EXPIRES }
  );

  // Store session hash
  if (supa) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await supa.from('sessions').insert({
      user_id: data.user.id, token_hash: tokenHash,
      ip_address: req.ip, user_agent: req.get('user-agent'),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).catch(() => {});
  }

  res.json({ token, user: { id: data.user.id, email: data.user.email, role, tier } });
});

app.post('/auth/refresh', requireAuth, (req, res) => {
  const token = jwt.sign(
    { sub: req.user.sub, email: req.user.email, role: req.user.role, tier: req.user.tier },
    JWT_SECRET, { expiresIn: JWT_EXPIRES }
  );
  res.json({ token });
});

app.post('/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  if (!supa) return res.status(503).json({ error: 'Auth service not configured' });
  await supa.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://zprimedoxaihq.com/reset-password',
  });
  // Always return success to avoid email enumeration
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

app.get('/auth/me', requireAuth, async (req, res) => {
  if (!supa) return res.json({ user: req.user });
  const { data: profile } = await supa.from('user_profiles')
    .select('email, full_name, role, tier, referral_code, stripe_customer_id, created_at')
    .eq('id', req.user.sub).single();
  res.json({ user: { ...req.user, ...profile } });
});

app.post('/auth/logout', requireAuth, async (req, res) => {
  if (supa) {
    const authHeader = req.headers.authorization?.slice(7);
    if (authHeader) {
      const tokenHash = crypto.createHash('sha256').update(authHeader).digest('hex');
      await supa.from('sessions').update({ revoked: true }).eq('token_hash', tokenHash).catch(() => {});
    }
  }
  res.json({ message: 'Logged out' });
});

// ═══════════════════════════════════════════════════════════════════
// TASK 7 — AI ROUTING WITH INTELLIGENT FALLBACK CHAIN
// ═══════════════════════════════════════════════════════════════════
// Chain: Claude → OpenAI → DeepSeek → Qwen → GLM
// All keys stored in Railway env vars — NEVER hardcoded.
// Per-tier rate limits: free=10/hr, pro=100/hr, enterprise=1000/hr
const AI_ROUTE_LIMITS = {
  free:       rateLimit({ windowMs: 3_600_000, max: 10,   keyGenerator: r => r.user?.sub || r.ip, standardHeaders: true, legacyHeaders: false }),
  pro:        rateLimit({ windowMs: 3_600_000, max: 100,  keyGenerator: r => r.user?.sub || r.ip, standardHeaders: true, legacyHeaders: false }),
  enterprise: rateLimit({ windowMs: 3_600_000, max: 1000, keyGenerator: r => r.user?.sub || r.ip, standardHeaders: true, legacyHeaders: false }),
};

app.post('/api/ai/route', requireAuth, async (req, res) => {
  const tier = req.user.tier || 'free';
  const limiter = AI_ROUTE_LIMITS[tier] || AI_ROUTE_LIMITS.free;
  limiter(req, res, async () => {
    const { messages, agent_id, max_tokens } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const systemPrompt = agent_id && AGENT_PROMPTS[agent_id] ? AGENT_PROMPTS[agent_id] : AGENT_PROMPTS['primedox'];
    const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    const maxTok = Math.min(max_tokens || 1024, tier === 'free' ? 512 : 2048);

    // Try Claude first (Anthropic SDK)
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const resp = await anthropic.messages.create({
          model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
          max_tokens: maxTok,
          system: systemPrompt,
          messages: messages,
        });
        return res.json({
          content: resp.content[0]?.text || '',
          provider: 'claude',
          model: resp.model,
          agent_id: agent_id || 'primedox',
        });
      } catch (e) {
        console.warn('[ai/route] Claude failed:', e.message);
      }
    }

    // Fallback: OpenAI → DeepSeek → Qwen → GLM (via existing chineseAIComplete)
    try {
      // Try OpenAI directly
      if (process.env.OPENAI_API_KEY) {
        const { client, model } = getClient(agent_id || 'primedox');
        const completion = await client.chat.completions.create({
          model, messages: fullMessages, max_tokens: maxTok, temperature: 0.7,
        });
        return res.json({
          content: completion.choices[0]?.message?.content || '',
          provider: 'openai',
          model,
          agent_id: agent_id || 'primedox',
        });
      }
      // Final fallback: Chinese AI chain
      const result = await chineseAIComplete(fullMessages, ['deepseek', 'qwen', 'glm', 'kimi'], { maxTokens: maxTok });
      return res.json({ ...result, agent_id: agent_id || 'primedox' });
    } catch (err) {
      res.status(503).json({ error: 'All AI providers exhausted. Add API keys to Railway env vars.', detail: err.message });
    }
  });
});

// Admin endpoint: view empire revenue summary
app.get('/api/admin/revenue', requireAdmin, async (req, res) => {
  if (!supa) return res.status(503).json({ error: 'Supabase not configured' });
  const { data, error } = await supa.from('payments')
    .select('provider, status, amount, currency, product_id, customer_email, created_at')
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  const total = (data || []).reduce((s, p) => s + parseFloat(p.amount), 0);
  res.json({ total_cad: total.toFixed(2), count: data.length, payments: data });
});

// ── Task 3: Gap Detection + Task 5: Marketplace ────────────────────
gapScanner.registerRoutes(app, scanLimiter);
marketplace.registerRoutes(app, generalLimiter, requireAuth, requireAdmin, supa);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nPrimeDox AI Backend v2.0 — ${LLM_BACKEND.toUpperCase()} mode`);
  console.log(`Model: ${LLM_BACKEND === 'openai' ? OPENAI_MODEL : GEMMA_MODEL}`);
  console.log(`Agents: ${Object.keys(AGENT_PROMPTS).length} system prompts loaded`);
  console.log(`Port: ${PORT}`);
  if (LLM_BACKEND !== 'openai') {
    console.log(`\nGemma endpoint: ${GEMMA_URL}`);
    console.log(`If Ollama not running: ollama serve`);
    console.log(`If model not pulled:   ollama pull ${GEMMA_MODEL}`);
  }
  console.log('\nEndpoints: GET / · POST /chat · POST /route · POST /swarm · POST /generate-motion · POST /translate · POST /suggest-fix\n');
});
