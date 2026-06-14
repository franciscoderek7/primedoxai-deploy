/*
 * PrimeDox AI — Agent Backend Server
 * Deploy to: Railway (railway.app) | Render (render.com) | Vercel Edge
 *
 * SETUP:
 * 1. npm install
 * 2. cp .env.example .env → add OPENAI_API_KEY
 * 3. node create-assistants.js → creates all 45 assistants in OpenAI
 * 4. node server.js
 * 5. Set PRIMEDOX_API_URL on all frontend sites to this server URL
 *
 * DEPLOY: Railway: railway up | Render: connect GitHub repo
 */

require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const OpenAI      = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Allowed origins (add your empire domains) ──
const ALLOWED_ORIGINS = [
  'https://omniaguard.com',
  'https://www.omniaguard.com',
  'https://franciscoholdingsinc.com',
  'https://www.franciscoholdingsinc.com',
  'https://zprimedoxaihq.com',
  'https://vigilax.com',
  'https://kiaros.ai',
  'https://ccldr.net',
  'https://cleanswarm.ca',
  'https://techpetcage.com',
  'https://techpackcage.com',
  'https://vaultvelocityauto.com',
  // GitHub Pages URLs
  'https://franciscoderek7.github.io',
  // Local dev
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1',
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

// Rate limit: 20 requests per minute per IP
const limiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/chat', limiter);

// ── Load assistant IDs (created by create-assistants.js) ──
let ASSISTANT_IDS = {};
try {
  ASSISTANT_IDS = require('./assistant-ids.json');
} catch(e) {
  console.warn('assistant-ids.json not found. Run: node create-assistants.js');
}

// ── Thread store (in-memory; use Redis in production) ──
const THREADS = new Map();

// ── Health check ──
app.get('/', (req, res) => res.json({
  status: 'PrimeDox AI Backend — online',
  agents: Object.keys(ASSISTANT_IDS).length,
  version: '1.0.0',
}));

// ── Chat endpoint ──
app.post('/chat', async (req, res) => {
  const { agent_id, messages, thread_id } = req.body;

  if (!agent_id || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'agent_id and messages required' });
  }

  const assistantId = ASSISTANT_IDS[agent_id];
  if (!assistantId) {
    return res.status(404).json({ error: 'Agent not found: ' + agent_id });
  }

  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user') {
    return res.status(400).json({ error: 'Last message must be from user' });
  }

  try {
    // Get or create thread
    let threadId = thread_id || THREADS.get(req.ip + ':' + agent_id);
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      THREADS.set(req.ip + ':' + agent_id, threadId);
    }

    // Add user message
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: lastMsg.content,
    });

    // Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });

    if (run.status !== 'completed') {
      return res.status(500).json({ error: 'Run failed: ' + run.status });
    }

    // Get latest assistant message
    const msgs = await openai.beta.threads.messages.list(threadId, { limit: 1 });
    const content = msgs.data[0]?.content?.[0];
    const responseText = content?.type === 'text' ? content.text.value : 'I encountered an issue. Please try again.';

    res.json({
      response: responseText,
      thread_id: threadId,
      agent_id: agent_id,
    });

  } catch(err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Service error. Please try again.' });
  }
});

// ── Route query (no thread needed — pure classification) ──
app.post('/route', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'query required' });

  const primedoxId = ASSISTANT_IDS['primedox'];
  if (!primedoxId) return res.status(503).json({ error: 'Routing assistant not configured' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are PrimeDox, a routing AI. Given a user query, respond with ONLY the agent ID from this list: sentinel, warden, counsel, archivist, defender, primedox, swarm, vetbot, torque, crate, chronos, ratehawk, alpha, keymaster, barrister, shield, ledger, visapath, guardian, scribe, gavel, incorporator, patent, advocate, terra, hardhat, spotlight, agentsports, anchor, wingman, vault, cipher, maya, bud, orbit, grid, pulse, helix, qubit, drive, hive, phoenix, timmy. Output ONLY the agent ID, nothing else.` },
        { role: 'user', content: query },
      ],
      max_tokens: 20,
      temperature: 0,
    });
    const agentId = completion.choices[0].message.content.trim().toLowerCase();
    res.json({ agent_id: agentId, query });
  } catch(err) {
    res.status(500).json({ error: 'Routing error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('PrimeDox AI Backend on port', PORT));
