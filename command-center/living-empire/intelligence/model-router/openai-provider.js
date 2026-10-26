'use strict';
/**
 * openai-provider.js — GPT-6 Astra provider for the FHI model router.
 *
 * ADDITIVE AND OPT-IN. This file does not change routing on its own. A
 * router would select it only when the operator sets
 * FHI_MODEL_PROVIDER=openai. See INTEGRATION at the bottom.
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
 * Verified against official sources 2026-10-26:
 *   model     gpt-6-astra      (OpenAI API, announced 2026-09-03)
 *   endpoint  POST https://api.openai.com/v1/responses
 *   auth      Authorization: Bearer $OPENAI_API_KEY
 *   cap       max_output_tokens
 *   pricing   $10 / 1M input tokens, $50 / 1M output tokens (standard)
 *
 * PAID PROVIDER. Every successful call costs money. This module refuses to
 * send a request unless the operator has explicitly opted in, and it never
 * falls back to OpenAI on a local failure.
 *
 * Credentials: read from process.env only. The key is never logged, never
 * placed in a returned object, never included in an error message, and
 * never written to disk.
 *
 * No dependency: node:https only. The openai SDK is not required.
 */

const https = require('node:https');

const ENDPOINT_HOST = 'api.openai.com';
const ENDPOINT_PATH = '/v1/responses';
const MODEL = 'gpt-6-astra';

const DEFAULTS = {
  MAX_OUTPUT_TOKENS: 800,     // bounded: cost and latency ceiling
  TIMEOUT_MS: 30_000,         // bounded per attempt
  MAX_ATTEMPTS: 3,            // 1 initial + 2 retries, transient only
  RETRY_BASE_MS: 500,
  MAX_INPUT_CHARS: 24_000,    // refuse oversized prompts before paying for them
};

const ROLES = new Set(['system', 'user', 'assistant']);

/** The router's shared result envelope. Never carries a credential. */
function envelope(fields) {
  return {
    mode: 'analysis-only',
    humanApprovalRequired: true,
    provider: 'openai-gpt6-astra',
    model: MODEL,
    ...fields,
  };
}

function failure(kind, message, extra) {
  return envelope({ ok: false, failure_kind: kind, error: message, ...extra });
}

/**
 * Is the paid provider explicitly enabled? Default is NO.
 * Only an exact, case-insensitive "openai" counts — no truthiness games.
 */
function isEnabled(env = process.env) {
  return String(env.FHI_MODEL_PROVIDER || '').trim().toLowerCase() === 'openai';
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
 * Extract assistant text from a Responses API payload.
 *
 * The text lives in output[] items of type "message", inside content[]
 * entries of type "output_text". Reasoning items carry no visible text, and
 * a refusal arrives as its own content type — both must be distinguished
 * from a successful answer rather than read as empty success.
 */
function parseResponse(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'response body was not an object' };
  }
  if (!Array.isArray(body.output)) {
    return { error: 'response had no output array' };
  }

  const refusals = [];
  const parts = [];
  for (const item of body.output) {
    if (!item || item.type !== 'message' || !Array.isArray(item.content)) continue;
    for (const c of item.content) {
      if (!c || typeof c !== 'object') continue;
      if (c.type === 'output_text' && typeof c.text === 'string') parts.push(c.text);
      else if (c.type === 'refusal' && typeof c.refusal === 'string') refusals.push(c.refusal);
    }
  }

  if (refusals.length) return { refusal: refusals.join('\n').trim() };

  const text = parts.join('').trim();
  if (text) return { text };

  // Empty text is never reported as success. The common cause is a cap hit
  // during reasoning, which emits reasoning items and no message item.
  if (body.status === 'incomplete') {
    const reason = body.incomplete_details && body.incomplete_details.reason;
    return {
      error: `model returned no text; status=incomplete${reason ? ` reason=${reason}` : ''}`,
      incomplete_reason: reason || null,
    };
  }
  return { error: 'model returned no text' };
}

function isTransient(status) {
  return status === 408 || status === 409 || status === 429 || (status >= 500 && status <= 599);
}

/** One HTTP attempt. Resolves { status, json, raw }; rejects on transport error. */
function postOnce({ payload, apiKey, timeoutMs, httpsImpl }) {
  const lib = httpsImpl || https;
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    let settled = false;
    const finish = (fn, arg) => { if (!settled) { settled = true; fn(arg); } };

    const req = lib.request(
      {
        host: ENDPOINT_HOST,
        path: ENDPOINT_PATH,
        method: 'POST',
        headers: {
          // The key is used here and nowhere else. It is never logged.
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
          if (raw.length > 2_000_000) { res.destroy(); finish(reject, new Error('response too large')); }
        });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(raw); } catch { /* left null — caller treats as malformed */ }
          finish(resolve, { status: res.statusCode, json, raw });
        });
        res.on('error', (e) => finish(reject, e));
      }
    );

    req.on('timeout', () => { req.destroy(); finish(reject, new Error(`timeout after ${timeoutMs}ms`)); });
    req.on('error', (e) => finish(reject, e));
    req.write(data);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * completeWithOpenAI({ messages, executive, maxOutputTokens, timeoutMs, env, httpsImpl, sleepImpl })
 *
 * Returns the router envelope. Never throws for an API-side problem; a
 * failure is reported as { ok: false, failure_kind, error }.
 */
async function completeWithOpenAI(opts = {}) {
  const {
    messages,
    executive = null,
    maxOutputTokens = DEFAULTS.MAX_OUTPUT_TOKENS,
    timeoutMs = DEFAULTS.TIMEOUT_MS,
    maxAttempts = DEFAULTS.MAX_ATTEMPTS,
    env = process.env,
    httpsImpl,
    sleepImpl = sleep,
  } = opts;

  // 1. Opt-in gate. A paid request is never sent by default.
  if (!isEnabled(env)) {
    return failure('provider_not_enabled',
      'OpenAI is a paid provider and is not enabled. Set FHI_MODEL_PROVIDER=openai to use it.',
      { executive });
  }

  // 2. Credential presence only — the value is never inspected or echoed.
  const apiKey = env.OPENAI_API_KEY;
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    return failure('not_configured',
      'OPENAI_API_KEY is not set in the environment.', { executive });
  }

  // 3. Input validation before spending anything.
  const invalid = validateMessages(messages);
  if (invalid) return failure('invalid_request', invalid, { executive });

  const cap = Number.isInteger(maxOutputTokens) && maxOutputTokens > 0
    ? Math.min(maxOutputTokens, 4000)      // hard ceiling regardless of caller
    : DEFAULTS.MAX_OUTPUT_TOKENS;

  const payload = {
    model: MODEL,
    input: messages.map((m) => ({ role: m.role, content: m.content })),
    max_output_tokens: cap,
  };

  let lastError = 'no attempt was made';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res;
    try {
      res = await postOnce({ payload, apiKey, timeoutMs, httpsImpl });
    } catch (e) {
      // Transport error or timeout: retryable, bounded.
      lastError = e && e.message ? e.message : 'transport error';
      if (attempt < maxAttempts) { await sleepImpl(DEFAULTS.RETRY_BASE_MS * attempt); continue; }
      return failure('unavailable', `request failed after ${attempt} attempt(s): ${lastError}`,
        { executive, attempts: attempt });
    }

    if (res.status === 401 || res.status === 403) {
      // Never retry an auth failure, and never echo the key or the body.
      return failure('auth_failed',
        `authentication rejected by the API (HTTP ${res.status}). Check OPENAI_API_KEY.`,
        { executive, attempts: attempt });
    }

    if (res.status === 404) {
      return failure('model_unavailable',
        `the API reported the model or endpoint as unavailable (HTTP 404). Model requested: ${MODEL}.`,
        { executive, attempts: attempt });
    }

    if (isTransient(res.status)) {
      lastError = `HTTP ${res.status}`;
      if (attempt < maxAttempts) { await sleepImpl(DEFAULTS.RETRY_BASE_MS * attempt); continue; }
      return failure('unavailable', `transient API failure persisted: ${lastError}`,
        { executive, attempts: attempt });
    }

    if (res.status < 200 || res.status >= 300) {
      // Permanent 4xx: do not retry, do not include the raw body.
      return failure('rejected', `the API rejected the request (HTTP ${res.status}).`,
        { executive, attempts: attempt });
    }

    if (res.json === null) {
      return failure('malformed_response', 'the API returned a body that was not valid JSON.',
        { executive, attempts: attempt });
    }

    const parsed = parseResponse(res.json);

    if (parsed.refusal) {
      return envelope({
        ok: true, executive, attempts: attempt,
        refused: true, text: parsed.refusal,
        usage: res.json.usage || null,
      });
    }

    if (parsed.error) {
      return failure('malformed_response', parsed.error,
        { executive, attempts: attempt, incomplete_reason: parsed.incomplete_reason ?? null });
    }

    return envelope({
      ok: true, executive, attempts: attempt,
      text: parsed.text,
      usage: res.json.usage || null,
    });
  }

  return failure('unavailable', `exhausted ${maxAttempts} attempt(s): ${lastError}`, { executive });
}

module.exports = {
  completeWithOpenAI,
  isEnabled,
  validateMessages,
  parseResponse,
  MODEL,
  ENDPOINT_HOST,
  ENDPOINT_PATH,
  DEFAULTS,
};

/* INTEGRATION — three lines in the router's index.js, NOT applied here:
 *
 *   const { completeWithOpenAI, isEnabled } = require('./openai-provider');
 *
 *   async function complete(opts) {
 *     if (isEnabled()) return completeWithOpenAI(opts);   // explicit opt-in only
 *     return completeWithLocalDefault(opts);              // unchanged default
 *   }
 *
 * No automatic fallback in either direction: a local failure must not
 * silently incur a paid request, and an OpenAI failure must not silently
 * mask itself behind the local model.
 */
