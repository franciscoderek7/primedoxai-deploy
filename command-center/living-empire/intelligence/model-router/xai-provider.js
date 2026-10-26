'use strict';
/**
 * xai-provider.js — xAI Grok provider for the FHI model router.
 *
 * ADDITIVE AND OPT-IN. Routing is unchanged unless the operator sets
 * FHI_MODEL_PROVIDER=xai.
 *
 * ── INTEGRATION STATUS: UNVERIFIED (2026-10-26) ─────────────────────
 * NO RUNTIME INTEGRATION IS CLAIMED. In THIS repository:
 *   · no model router exists; this directory holds only the two provider
 *     modules and their tests
 *   · nothing imports this module
 *   · nothing outside this directory reads FHI_MODEL_PROVIDER, so the
 *     switch described below is honoured by no existing caller
 *   · the local default in this repo is Gemma 3 27B via Ollama
 *     (agents/backend/gemma-server.js:92-94), NOT Qwen. Qwen here is a
 *     remote paid vendor inside a 5-provider chain
 *     (agents/backend/chinese-ai-providers.js:37-41).
 * Integration with FHI's router is a SEPARATE, OUTSTANDING task requiring
 * the actual router source and offline integration tests. The standalone
 * suite beside this file proves this module in isolation only.
 * ────────────────────────────────────────────────────────────
 *
 * ── MODEL ID: READ THIS ──────────────────────────────────────────────────
 * I could NOT confirm the current Grok model id against xAI's own
 * documentation (docs.x.ai). The searches that returned results were
 * third-party aggregators, and they disagreed with each other.
 *
 * What they agreed on, 2026-10-26:
 *   endpoint   POST https://api.x.ai/v1/chat/completions   (OpenAI-compatible)
 *   auth       Authorization: Bearer $XAI_API_KEY
 *   flagship   grok-4.7   (reportedly released 2026-09-21)
 *
 * What they disagreed on: which older ids are still live, and whether
 * several grok-4.x variants were retired in May 2026 (requests to retired
 * ids reportedly redirect to grok-4.3).
 *
 * Because the brief says not to guess a model name, the id is NOT
 * hardcoded as verified. It is read from XAI_MODEL, with grok-4.7 as a
 * documented default. Confirm against docs.x.ai and set XAI_MODEL
 * explicitly before relying on it.
 *
 * RE-CHECK 2026-10-26: two searches scoped to docs.x.ai and x.ai both
 * returned grok-4.7 as the current flagship text model. That is
 * corroborating but NOT firsthand: docs.x.ai, x.ai and api.x.ai all fail
 * DNS resolution from the build environment, so the pages could not be
 * read directly, and one search summary contained a clear factual error
 * elsewhere in its output. The verification flag below therefore stays
 * false. Flip it only after reading docs.x.ai directly.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * PAID PROVIDER. Reported pricing ~$2 / 1M input and ~$6 / 1M output
 * tokens — also third-party, also unconfirmed.
 *
 * Credentials: process.env.XAI_API_KEY only. Never logged, never returned,
 * never in an error message.
 *
 * Uses native fetch (Node 18+). No dependency.
 */

const ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const DEFAULT_MODEL = 'grok-4.7';   // unconfirmed — see the note above

const DEFAULTS = {
  MAX_TOKENS: 800,
  TIMEOUT_MS: 30_000,
  MAX_ATTEMPTS: 3,
  RETRY_BASE_MS: 500,
  MAX_INPUT_CHARS: 24_000,
  TOKEN_CEILING: 4000,
};

const ROLES = new Set(['system', 'user', 'assistant']);

function resolveModel(env = process.env) {
  const v = String(env.XAI_MODEL || '').trim();
  return v || DEFAULT_MODEL;
}

function envelope(fields, env) {
  return {
    mode: 'analysis-only',
    humanApprovalRequired: true,
    provider: 'xai-grok',
    model: resolveModel(env),
    model_id_verified_against_official_docs: false,
    ...fields,
  };
}

const failure = (kind, message, extra, env) =>
  envelope({ ok: false, failure_kind: kind, error: message, ...extra }, env);

/** Explicit opt-in only. Exactly "xai", case-insensitive, trimmed. */
function isEnabled(env = process.env) {
  return String(env.FHI_MODEL_PROVIDER || '').trim().toLowerCase() === 'xai';
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array';
  }
  let chars = 0;
  for (const [i, m] of messages.entries()) {
    if (!m || typeof m !== 'object') return `messages[${i}] is not an object`;
    if (!ROLES.has(m.role)) {
      return `messages[${i}].role must be one of system, user, assistant`;
    }
    if (typeof m.content !== 'string' || !m.content.trim()) {
      return `messages[${i}].content must be a non-empty string`;
    }
    chars += m.content.length;
  }
  if (chars > DEFAULTS.MAX_INPUT_CHARS) {
    return `input is ${chars} characters; the limit is ${DEFAULTS.MAX_INPUT_CHARS}`;
  }
  return null;
}

/**
 * Parse an OpenAI-compatible chat-completions body.
 * Note this is a DIFFERENT shape from the OpenAI Responses API: the text
 * is at choices[0].message.content, and a refusal may appear as
 * choices[0].message.refusal with finish_reason "content_filter".
 */
function parseResponse(body) {
  if (!body || typeof body !== 'object') return { error: 'response body was not an object' };
  if (!Array.isArray(body.choices) || body.choices.length === 0) {
    return { error: 'response had no choices array' };
  }
  const choice = body.choices[0];
  const msg = choice && choice.message;
  if (!msg || typeof msg !== 'object') return { error: 'first choice had no message' };

  if (typeof msg.refusal === 'string' && msg.refusal.trim()) {
    return { refusal: msg.refusal.trim() };
  }
  if (choice.finish_reason === 'content_filter') {
    return { refusal: 'the provider filtered this response' };
  }

  const text = typeof msg.content === 'string' ? msg.content.trim() : '';
  if (text) {
    return { text, truncated: choice.finish_reason === 'length' };
  }
  // Empty content is never success. A length stop with no text means the
  // cap was consumed before any visible output.
  if (choice.finish_reason === 'length') {
    return { error: 'model returned no text; finish_reason=length (token cap reached)' };
  }
  return { error: `model returned no text; finish_reason=${choice.finish_reason ?? 'unknown'}` };
}

const isTransient = (s) => s === 408 || s === 409 || s === 429 || (s >= 500 && s <= 599);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function completeWithXai(opts = {}) {
  const {
    messages,
    executive = null,
    maxTokens = DEFAULTS.MAX_TOKENS,
    timeoutMs = DEFAULTS.TIMEOUT_MS,
    maxAttempts = DEFAULTS.MAX_ATTEMPTS,
    env = process.env,
    fetchImpl = globalThis.fetch,
    sleepImpl = sleep,
  } = opts;

  if (!isEnabled(env)) {
    return failure('provider_not_enabled',
      'xAI is a paid provider and is not enabled. Set FHI_MODEL_PROVIDER=xai to use it.',
      { executive }, env);
  }

  const apiKey = env.XAI_API_KEY;
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    return failure('not_configured', 'XAI_API_KEY is not set in the environment.', { executive }, env);
  }

  const invalid = validateMessages(messages);
  if (invalid) return failure('invalid_request', invalid, { executive }, env);

  if (typeof fetchImpl !== 'function') {
    return failure('unavailable', 'no fetch implementation is available in this runtime.', { executive }, env);
  }

  const cap = Number.isInteger(maxTokens) && maxTokens > 0
    ? Math.min(maxTokens, DEFAULTS.TOKEN_CEILING)
    : DEFAULTS.MAX_TOKENS;

  const payload = {
    model: resolveModel(env),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: cap,
  };

  let lastError = 'no attempt was made';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res, bodyText;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      res = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: {
          // Used here only. Never logged or returned.
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });
      bodyText = await res.text();
    } catch (e) {
      const aborted = e && (e.name === 'AbortError' || /abort/i.test(e.message || ''));
      lastError = aborted ? `timeout after ${timeoutMs}ms` : (e && e.message) || 'transport error';
      if (attempt < maxAttempts) { await sleepImpl(DEFAULTS.RETRY_BASE_MS * attempt); continue; }
      return failure('unavailable', `request failed after ${attempt} attempt(s): ${lastError}`,
        { executive, attempts: attempt }, env);
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 401 || res.status === 403) {
      return failure('auth_failed',
        `authentication rejected by the API (HTTP ${res.status}). Check XAI_API_KEY.`,
        { executive, attempts: attempt }, env);
    }
    if (res.status === 404) {
      return failure('model_unavailable',
        `the API reported the model or endpoint as unavailable (HTTP 404). ` +
        `Model requested: ${resolveModel(env)}. Confirm the id against docs.x.ai and set XAI_MODEL.`,
        { executive, attempts: attempt }, env);
    }
    if (isTransient(res.status)) {
      lastError = `HTTP ${res.status}`;
      if (attempt < maxAttempts) { await sleepImpl(DEFAULTS.RETRY_BASE_MS * attempt); continue; }
      return failure('unavailable', `transient API failure persisted: ${lastError}`,
        { executive, attempts: attempt }, env);
    }
    if (!res.ok) {
      return failure('rejected', `the API rejected the request (HTTP ${res.status}).`,
        { executive, attempts: attempt }, env);
    }

    let json = null;
    try { json = JSON.parse(bodyText); } catch { /* malformed */ }
    if (json === null) {
      return failure('malformed_response', 'the API returned a body that was not valid JSON.',
        { executive, attempts: attempt }, env);
    }

    const parsed = parseResponse(json);
    if (parsed.refusal) {
      return envelope({ ok: true, executive, attempts: attempt, refused: true,
        text: parsed.refusal, usage: json.usage || null }, env);
    }
    if (parsed.error) {
      return failure('malformed_response', parsed.error, { executive, attempts: attempt }, env);
    }
    return envelope({ ok: true, executive, attempts: attempt, text: parsed.text,
      truncated: Boolean(parsed.truncated), usage: json.usage || null }, env);
  }

  return failure('unavailable', `exhausted ${maxAttempts} attempt(s): ${lastError}`, { executive }, env);
}

module.exports = {
  completeWithXai, isEnabled, validateMessages, parseResponse, resolveModel,
  ENDPOINT, DEFAULT_MODEL, DEFAULTS,
};

/* INTEGRATION — the router's index.js, three providers, NOT applied:
 *
 *   const openai = require('./openai-provider');
 *   const xai    = require('./xai-provider');
 *
 *   async function complete(opts) {
 *     if (openai.isEnabled()) return openai.completeWithOpenAI(opts);
 *     if (xai.isEnabled())    return xai.completeWithXai(opts);
 *     return completeWithLocalDefault(opts);       // unchanged default
 *   }
 *
 * FHI_MODEL_PROVIDER accepts: unset (local default) · openai · xai
 * No fallback in any direction — a failure is reported, never masked.
 */
