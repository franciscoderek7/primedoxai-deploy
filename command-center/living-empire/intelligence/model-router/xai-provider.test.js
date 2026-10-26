/**
 * Mocked tests for the xAI Grok provider.
 * No API key, no network, no cost — fetch is injected.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const xai = require('./xai-provider.js');
const openai = require('./openai-provider.js');
const {
  completeWithXai, isEnabled, validateMessages, parseResponse, resolveModel,
  ENDPOINT, DEFAULT_MODEL,
} = xai;

const ENV_ON = { FHI_MODEL_PROVIDER: 'xai', XAI_API_KEY: 'test-key-not-real' };
const MSG = [{ role: 'user', content: 'Analyse this.' }];
const noSleep = () => Promise.resolve();

/** script entries: {status, body} | {throw:'msg'} | {abort:true} */
function mockFetch(script) {
  const calls = [];
  let i = 0;
  const fn = async (url, init) => {
    const step = script[Math.min(i, script.length - 1)];
    i += 1;
    calls.push({ url, init, body: init && init.body });
    if (step.throw) throw new Error(step.throw);
    if (step.abort) { const e = new Error('The operation was aborted'); e.name = 'AbortError'; throw e; }
    const payload = typeof step.body === 'string' ? step.body : JSON.stringify(step.body);
    return {
      status: step.status,
      ok: step.status >= 200 && step.status < 300,
      text: async () => payload,
    };
  };
  fn.calls = calls;
  return fn;
}

const okBody = (content, finish = 'stop') => ({
  id: 'chat_test',
  choices: [{ index: 0, finish_reason: finish, message: { role: 'assistant', content } }],
  usage: { prompt_tokens: 10, completion_tokens: 4 },
});

// ── provider selection ──────────────────────────────────────────────

test('01 disabled by default — no paid request', async () => {
  const f = mockFetch([{ status: 200, body: okBody('never') }]);
  const r = await completeWithXai({ messages: MSG, env: {}, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'provider_not_enabled');
  assert.equal(f.calls.length, 0);
});

test('02 the two paid providers are mutually exclusive', () => {
  assert.equal(xai.isEnabled({ FHI_MODEL_PROVIDER: 'openai' }), false, 'openai must not enable xai');
  assert.equal(openai.isEnabled({ FHI_MODEL_PROVIDER: 'xai' }), false, 'xai must not enable openai');
  assert.equal(xai.isEnabled({ FHI_MODEL_PROVIDER: 'xai' }), true);
  assert.equal(openai.isEnabled({ FHI_MODEL_PROVIDER: 'openai' }), true);
});

test('03 the local default is preserved — neither paid provider activates', () => {
  for (const env of [{}, { FHI_MODEL_PROVIDER: '' }, { FHI_MODEL_PROVIDER: 'local-qwen' },
                     { FHI_MODEL_PROVIDER: '1' }, { FHI_MODEL_PROVIDER: 'true' }]) {
    assert.equal(xai.isEnabled(env), false, `${JSON.stringify(env)} must not enable xai`);
    assert.equal(openai.isEnabled(env), false, `${JSON.stringify(env)} must not enable openai`);
  }
});

test('04 enabled without a key sends nothing', async () => {
  const f = mockFetch([{ status: 200, body: okBody('x') }]);
  const r = await completeWithXai({ messages: MSG, env: { FHI_MODEL_PROVIDER: 'xai' }, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'not_configured');
  assert.equal(f.calls.length, 0);
});

// ── the model id is operator-configurable, not asserted as verified ──────

test('05 the model id defaults but is overridable, and is flagged unverified', async () => {
  assert.equal(resolveModel({}), DEFAULT_MODEL);
  assert.equal(resolveModel({ XAI_MODEL: 'grok-4.3' }), 'grok-4.3');
  const f = mockFetch([{ status: 200, body: okBody('x') }]);
  const r = await completeWithXai({
    messages: MSG, env: { ...ENV_ON, XAI_MODEL: 'grok-4.3' }, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(JSON.parse(f.calls[0].body).model, 'grok-4.3', 'the operator value must reach the request');
  assert.equal(r.model, 'grok-4.3');
  assert.equal(r.model_id_verified_against_official_docs, false,
    'the envelope must not claim the id was confirmed against official docs');
});

// ── happy path and the chat-completions shape ───────────────────────────

test('06 a successful chat-completions reply is parsed', async () => {
  const f = mockFetch([{ status: 200, body: okBody('Grok analysis.') }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, executive: 'vigilax', fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.text, 'Grok analysis.');
  assert.equal(r.provider, 'xai-grok');
  assert.equal(r.executive, 'vigilax');
  assert.equal(r.attempts, 1);
  assert.deepEqual(r.usage, { prompt_tokens: 10, completion_tokens: 4 });
});

test('07 the envelope preserves analysis-only and human approval on success and failure', async () => {
  const f = mockFetch([{ status: 200, body: okBody('x') }]);
  const ok = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  const bad = await completeWithXai({ messages: MSG, env: {}, fetchImpl: f, sleepImpl: noSleep });
  for (const r of [ok, bad]) {
    assert.equal(r.mode, 'analysis-only');
    assert.equal(r.humanApprovalRequired, true);
    assert.equal(r.provider, 'xai-grok');
  }
});

test('08 the request targets the documented endpoint and auth scheme', async () => {
  const f = mockFetch([{ status: 200, body: okBody('x') }]);
  await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  const { url, init, body } = f.calls[0];
  assert.equal(url, ENDPOINT);
  assert.equal(init.method, 'POST');
  assert.match(init.headers.Authorization, /^Bearer /);
  const sent = JSON.parse(body);
  assert.ok(Array.isArray(sent.messages), 'chat-completions uses messages[], not input[]');
  assert.equal(typeof sent.max_tokens, 'number');
});

test('09 an abort signal is attached so the timeout can fire', async () => {
  const f = mockFetch([{ status: 200, body: okBody('x') }]);
  await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.ok(f.calls[0].init.signal, 'every request must carry an abort signal');
});

// ── credential hygiene ──────────────────────────────────────────────

test('10 the API key never appears in any returned value', async () => {
  const SECRET = 'xai-SENTINEL-must-not-leak';
  const results = [];
  results.push(await completeWithXai({ messages: MSG, env: { FHI_MODEL_PROVIDER: 'xai', XAI_API_KEY: SECRET },
    fetchImpl: mockFetch([{ status: 200, body: okBody('fine') }]), sleepImpl: noSleep }));
  results.push(await completeWithXai({ messages: MSG, env: { FHI_MODEL_PROVIDER: 'xai', XAI_API_KEY: SECRET },
    fetchImpl: mockFetch([{ status: 401, body: { error: `bad key ${SECRET}` } }]), sleepImpl: noSleep }));
  for (const r of results) {
    assert.ok(!JSON.stringify(r).includes(SECRET));
    assert.ok(!JSON.stringify(r).includes('xai-SENTINEL'));
  }
});

test('11 the provider error body is not echoed to the caller', async () => {
  const f = mockFetch([{ status: 400, body: { error: 'internal LEAKME detail' } }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.ok, false);
  assert.ok(!JSON.stringify(r).includes('LEAKME'));
});

// ── error taxonomy ───────────────────────────────────────────────────

test('12 auth failures are permanent and never retried', async () => {
  for (const status of [401, 403]) {
    const f = mockFetch([{ status, body: {} }]);
    const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
    assert.equal(r.failure_kind, 'auth_failed');
    assert.equal(f.calls.length, 1);
  }
});

test('13 a 404 names the model and points at the official docs', async () => {
  const f = mockFetch([{ status: 404, body: {} }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'model_unavailable');
  assert.match(r.error, /grok-4\.7/);
  assert.match(r.error, /docs\.x\.ai/);
  assert.equal(f.calls.length, 1);
});

test('14 a permanent 4xx is not retried', async () => {
  const f = mockFetch([{ status: 422, body: {} }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'rejected');
  assert.equal(f.calls.length, 1);
});

test('15 transient errors retry exactly to the bound', async () => {
  for (const status of [429, 500, 503]) {
    const f = mockFetch([{ status, body: {} }]);
    const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep, maxAttempts: 3 });
    assert.equal(r.failure_kind, 'unavailable');
    assert.equal(f.calls.length, 3);
    assert.equal(r.attempts, 3);
  }
});

test('16 transient then success resolves cleanly', async () => {
  const f = mockFetch([{ status: 503, body: {} }, { status: 200, body: okBody('recovered') }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.text, 'recovered');
  assert.equal(r.attempts, 2);
});

test('17 a timeout is retried to the bound and never reported as success', async () => {
  const f = mockFetch([{ abort: true }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep, maxAttempts: 2 });
  assert.equal(r.ok, false);
  assert.equal(r.failure_kind, 'unavailable');
  assert.match(r.error, /timeout/i);
  assert.equal(f.calls.length, 2);
});

test('18 a transport error is retried to the bound', async () => {
  const f = mockFetch([{ throw: 'ECONNREFUSED' }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep, maxAttempts: 2 });
  assert.equal(r.failure_kind, 'unavailable');
  assert.match(r.error, /ECONNREFUSED/);
  assert.equal(f.calls.length, 2);
});

test('19 a non-JSON body is malformed, not empty success', async () => {
  const f = mockFetch([{ status: 200, body: '<html>gateway</html>' }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'malformed_response');
});

test('20 a missing fetch implementation fails closed', async () => {
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: undefined, sleepImpl: noSleep });
  assert.equal(r.ok, false);
  assert.equal(r.failure_kind, 'unavailable');
});

// ── response-shape edge cases (chat-completions, not Responses API) ──────

test('21 empty content with finish_reason=length is a failure', () => {
  const p = parseResponse({ choices: [{ finish_reason: 'length', message: { content: '' } }] });
  assert.ok(p.error);
  assert.match(p.error, /token cap/);
});

test('22 a refusal field is surfaced distinctly', () => {
  const p = parseResponse({ choices: [{ finish_reason: 'stop', message: { refusal: 'I cannot.' } }] });
  assert.equal(p.refusal, 'I cannot.');
  assert.equal(p.text, undefined);
});

test('23 a content_filter finish is treated as a refusal', () => {
  const p = parseResponse({ choices: [{ finish_reason: 'content_filter', message: { content: '' } }] });
  assert.ok(p.refusal);
});

test('24 a refusal returns ok with refused:true', async () => {
  const f = mockFetch([{ status: 200, body: { choices: [{ finish_reason: 'stop', message: { refusal: 'Declined.' } }] } }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.refused, true);
  assert.equal(r.text, 'Declined.');
});

test('25 truncation is reported rather than hidden', async () => {
  const f = mockFetch([{ status: 200, body: okBody('partial answer', 'length') }]);
  const r = await completeWithXai({ messages: MSG, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.truncated, true);
});

test('26 missing, empty and malformed choices all fail closed', () => {
  assert.ok(parseResponse({}).error);
  assert.ok(parseResponse({ choices: [] }).error);
  assert.ok(parseResponse({ choices: 'nope' }).error);
  assert.ok(parseResponse(null).error);
  assert.ok(parseResponse({ choices: [{}] }).error);
  assert.ok(parseResponse({ choices: [{ message: { content: '   ' }, finish_reason: 'stop' }] }).error);
});

// ── bounds ──────────────────────────────────────────────────────────

test('27 roles and content are validated before any request', async () => {
  const bad = [[], 'nope', [{ role: 'wizard', content: 'x' }], [{ role: 'user' }], [null]];
  for (const messages of bad) {
    const f = mockFetch([{ status: 200, body: okBody('x') }]);
    const r = await completeWithXai({ messages, env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
    assert.equal(r.failure_kind, 'invalid_request');
    assert.equal(f.calls.length, 0, 'an invalid request must never reach the paid API');
  }
  assert.equal(validateMessages([{ role: 'system', content: 'ok' }]), null);
});

test('28 oversized input is refused before incurring cost', async () => {
  const f = mockFetch([{ status: 200, body: okBody('x') }]);
  const r = await completeWithXai({ messages: [{ role: 'user', content: 'x'.repeat(30_000) }],
    env: ENV_ON, fetchImpl: f, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'invalid_request');
  assert.equal(f.calls.length, 0);
});

test('29 the token cap is bounded regardless of the caller', async () => {
  const f = mockFetch([{ status: 200, body: okBody('x') }]);
  await completeWithXai({ messages: MSG, env: ENV_ON, maxTokens: 999_999, fetchImpl: f, sleepImpl: noSleep });
  assert.ok(JSON.parse(f.calls[0].body).max_tokens <= 4000);
});
