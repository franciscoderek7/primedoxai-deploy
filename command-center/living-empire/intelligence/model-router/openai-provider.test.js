/**
 * Mocked tests for the GPT-6 Astra provider.
 *
 * No API key, no network, no cost. Every HTTP exchange is injected through
 * the httpsImpl seam, so these run in CI and on a laptop identically.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');

const {
  completeWithOpenAI, isEnabled, validateMessages, parseResponse, MODEL,
  ENDPOINT_HOST, ENDPOINT_PATH,
} = require('./openai-provider.js');

const ENV_ON = { FHI_MODEL_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key-not-real' };
const MSG = [{ role: 'user', content: 'Analyse this.' }];
const noSleep = () => Promise.resolve();

/**
 * Fake https.request. `script` is an array consumed one entry per attempt:
 *   { status, body }            -> an HTTP response
 *   { throw: 'message' }        -> a transport error
 *   { timeout: true }           -> fires the 'timeout' event
 * Records every request it was handed, so headers can be inspected.
 */
function mockHttps(script) {
  const calls = [];
  let i = 0;
  return {
    calls,
    request(options, cb) {
      const step = script[Math.min(i, script.length - 1)];
      i += 1;
      const req = new EventEmitter();
      let written = '';
      req.write = (d) => { written += d; };
      req.destroy = () => {};
      req.end = () => {
        calls.push({ options, body: written });
        setImmediate(() => {
          if (step.throw) return req.emit('error', new Error(step.throw));
          if (step.timeout) return req.emit('timeout');
          const res = new EventEmitter();
          res.statusCode = step.status;
          res.setEncoding = () => {};
          cb(res);
          setImmediate(() => {
            const payload = typeof step.body === 'string' ? step.body : JSON.stringify(step.body);
            if (payload) res.emit('data', payload);
            res.emit('end');
          });
        });
      };
      return req;
    },
  };
}

const okBody = (text) => ({
  id: 'resp_test', status: 'completed',
  output: [{ type: 'message', content: [{ type: 'output_text', text }] }],
  usage: { input_tokens: 10, output_tokens: 5 },
});

// ── provider selection: paid calls must be opt-in ───────────────────────

test('01 the provider is disabled by default — no paid request is sent', async () => {
  const m = mockHttps([{ status: 200, body: okBody('should never be reached') }]);
  const r = await completeWithOpenAI({ messages: MSG, env: {}, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.ok, false);
  assert.equal(r.failure_kind, 'provider_not_enabled');
  assert.equal(m.calls.length, 0, 'no HTTP request may be made when the provider is off');
});

test('02 a truthy-but-wrong provider value does not enable OpenAI', () => {
  for (const v of ['1', 'true', 'yes', 'OpenAI-ish', 'local', '']) {
    assert.equal(isEnabled({ FHI_MODEL_PROVIDER: v }), false, `"${v}" must not enable the paid provider`);
  }
  assert.equal(isEnabled({ FHI_MODEL_PROVIDER: 'openai' }), true);
  assert.equal(isEnabled({ FHI_MODEL_PROVIDER: ' OpenAI ' }), true, 'trimmed and case-insensitive');
});

test('03 enabled but no key configured — still no request', async () => {
  const m = mockHttps([{ status: 200, body: okBody('x') }]);
  const r = await completeWithOpenAI({
    messages: MSG, env: { FHI_MODEL_PROVIDER: 'openai' }, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'not_configured');
  assert.equal(m.calls.length, 0);
});

// ── the happy path ──────────────────────────────────────────────────

test('04 a successful Responses API reply is parsed', async () => {
  const m = mockHttps([{ status: 200, body: okBody('Astra analysis.') }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, executive: 'primedox', httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.text, 'Astra analysis.');
  assert.equal(r.provider, 'openai-gpt6-astra');
  assert.equal(r.model, MODEL);
  assert.equal(r.executive, 'primedox');
  assert.equal(r.attempts, 1);
  assert.deepEqual(r.usage, { input_tokens: 10, output_tokens: 5 });
});

test('05 the envelope preserves analysis-only and human approval', async () => {
  const m = mockHttps([{ status: 200, body: okBody('text') }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.mode, 'analysis-only');
  assert.equal(r.humanApprovalRequired, true);
});

test('06 every failure envelope also carries the safeguards', async () => {
  const cases = [
    [{}, {}],                                                   // disabled
    [{ FHI_MODEL_PROVIDER: 'openai' }, {}],                      // no key
    [ENV_ON, { status: 401, body: {} }],                         // auth
    [ENV_ON, { status: 400, body: {} }],                         // rejected
  ];
  for (const [env, step] of cases) {
    const m = mockHttps([step.status ? step : { status: 200, body: okBody('x') }]);
    const r = await completeWithOpenAI({ messages: MSG, env, httpsImpl: m, sleepImpl: noSleep });
    assert.equal(r.mode, 'analysis-only');
    assert.equal(r.humanApprovalRequired, true);
    assert.equal(r.provider, 'openai-gpt6-astra');
  }
});

test('07 the request targets the official endpoint, model and auth scheme', async () => {
  const m = mockHttps([{ status: 200, body: okBody('x') }]);
  await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  const { options, body } = m.calls[0];
  assert.equal(options.host, ENDPOINT_HOST);
  assert.equal(options.path, ENDPOINT_PATH);
  assert.equal(options.method, 'POST');
  assert.match(options.headers.Authorization, /^Bearer /);
  const sent = JSON.parse(body);
  assert.equal(sent.model, 'gpt-6-astra');
  assert.ok(Array.isArray(sent.input));
  assert.equal(typeof sent.max_output_tokens, 'number');
});

// ── credential hygiene ──────────────────────────────────────────────

test('08 the API key never appears in any returned value', async () => {
  const SECRET = 'sk-SENTINEL-must-not-leak';
  const m = mockHttps([{ status: 200, body: okBody('fine') }]);
  const results = [];
  results.push(await completeWithOpenAI({
    messages: MSG, env: { FHI_MODEL_PROVIDER: 'openai', OPENAI_API_KEY: SECRET },
    httpsImpl: m, sleepImpl: noSleep }));
  const m2 = mockHttps([{ status: 401, body: { error: { message: `bad key ${SECRET}` } } }]);
  results.push(await completeWithOpenAI({
    messages: MSG, env: { FHI_MODEL_PROVIDER: 'openai', OPENAI_API_KEY: SECRET },
    httpsImpl: m2, sleepImpl: noSleep }));
  for (const r of results) {
    assert.ok(!JSON.stringify(r).includes(SECRET), 'the key must not appear in the result');
    assert.ok(!JSON.stringify(r).includes('sk-'), 'no key-shaped string may appear');
  }
});

test('09 a provider-side error body is not echoed back to the caller', async () => {
  const m = mockHttps([{ status: 400, body: { error: { message: 'internal detail LEAKME' } } }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.ok, false);
  assert.ok(!JSON.stringify(r).includes('LEAKME'), 'the raw provider body must not be forwarded');
});

// ── error taxonomy ───────────────────────────────────────────────────

test('10 authentication failure is permanent and never retried', async () => {
  for (const status of [401, 403]) {
    const m = mockHttps([{ status, body: {} }]);
    const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
    assert.equal(r.failure_kind, 'auth_failed');
    assert.equal(m.calls.length, 1, `HTTP ${status} must not be retried`);
  }
});

test('11 a 404 is reported as the model or endpoint being unavailable', async () => {
  const m = mockHttps([{ status: 404, body: {} }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'model_unavailable');
  assert.match(r.error, /gpt-6-astra/);
  assert.equal(m.calls.length, 1);
});

test('12 a permanent 4xx is not retried', async () => {
  const m = mockHttps([{ status: 400, body: {} }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'rejected');
  assert.equal(m.calls.length, 1);
});

test('13 a transient error is retried, bounded, then reported', async () => {
  for (const status of [429, 500, 503]) {
    const m = mockHttps([{ status, body: {} }]);
    const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep, maxAttempts: 3 });
    assert.equal(r.failure_kind, 'unavailable');
    assert.equal(m.calls.length, 3, `HTTP ${status} must be retried exactly to the bound`);
    assert.equal(r.attempts, 3);
  }
});

test('14 a transient error followed by success resolves without reporting failure', async () => {
  const m = mockHttps([{ status: 503, body: {} }, { status: 200, body: okBody('recovered') }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.text, 'recovered');
  assert.equal(r.attempts, 2);
});

test('15 a timeout is retried to the bound and never reported as success', async () => {
  const m = mockHttps([{ timeout: true }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep, maxAttempts: 2 });
  assert.equal(r.ok, false);
  assert.equal(r.failure_kind, 'unavailable');
  assert.match(r.error, /timeout/i);
  assert.equal(m.calls.length, 2);
});

test('16 a transport error is retried to the bound', async () => {
  const m = mockHttps([{ throw: 'ECONNRESET' }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep, maxAttempts: 2 });
  assert.equal(r.failure_kind, 'unavailable');
  assert.match(r.error, /ECONNRESET/);
  assert.equal(m.calls.length, 2);
});

test('17 a non-JSON body is reported as malformed, not as empty success', async () => {
  const m = mockHttps([{ status: 200, body: '<html>gateway</html>' }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.ok, false);
  assert.equal(r.failure_kind, 'malformed_response');
});

// ── response-shape edge cases ────────────────────────────────────────

test('18 reasoning-only output from a token cap is a failure, not empty success', () => {
  // The documented trap: status=incomplete with reason=max_output_tokens
  // emits reasoning items and NO message item, so the text is empty.
  const parsed = parseResponse({
    status: 'incomplete',
    incomplete_details: { reason: 'max_output_tokens' },
    output: [{ type: 'reasoning', summary: [] }],
  });
  assert.ok(parsed.error, 'must not return empty text as a success');
  assert.match(parsed.error, /incomplete/);
  assert.equal(parsed.incomplete_reason, 'max_output_tokens');
});

test('19 a refusal is surfaced distinctly from an answer', () => {
  const parsed = parseResponse({
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'I cannot help with that.' }] }],
  });
  assert.equal(parsed.refusal, 'I cannot help with that.');
  assert.equal(parsed.text, undefined);
});

test('20 a refusal returns ok with refused:true, not a silent empty answer', async () => {
  const m = mockHttps([{ status: 200, body: {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'Declined.' }] }],
  } }]);
  const r = await completeWithOpenAI({ messages: MSG, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.refused, true);
  assert.equal(r.text, 'Declined.');
});

test('21 reasoning items are skipped and message text is still found', () => {
  const parsed = parseResponse({
    status: 'completed',
    output: [
      { type: 'reasoning', summary: [] },
      { type: 'message', content: [{ type: 'output_text', text: 'Answer.' }] },
    ],
  });
  assert.equal(parsed.text, 'Answer.');
});

test('22 missing, empty and malformed output arrays all fail closed', () => {
  assert.ok(parseResponse({}).error);
  assert.ok(parseResponse({ output: [] }).error);
  assert.ok(parseResponse({ output: 'nope' }).error);
  assert.ok(parseResponse(null).error);
  assert.ok(parseResponse({ output: [{ type: 'message', content: [] }] }).error);
  assert.ok(parseResponse({ output: [{ type: 'message', content: [{ type: 'output_text', text: '   ' }] }] }).error,
    'whitespace-only text is not an answer');
});

// ── input validation and bounds ─────────────────────────────────────

test('23 message roles and content are validated before any request', async () => {
  const bad = [
    [[], /non-empty array/],
    ['nope', /non-empty array/],
    [[{ role: 'wizard', content: 'x' }], /role must be one of/],
    [[{ role: 'user' }], /content must be a non-empty string/],
    [[{ role: 'user', content: '   ' }], /content must be a non-empty string/],
    [[null], /not an object/],
  ];
  for (const [messages, re] of bad) {
    const m = mockHttps([{ status: 200, body: okBody('x') }]);
    const r = await completeWithOpenAI({ messages, env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
    assert.equal(r.failure_kind, 'invalid_request', `expected rejection for ${JSON.stringify(messages)}`);
    assert.match(r.error, re);
    assert.equal(m.calls.length, 0, 'an invalid request must never reach the paid API');
  }
  assert.equal(validateMessages([{ role: 'system', content: 'ok' }]), null);
});

test('24 an oversized input is refused before incurring cost', async () => {
  const m = mockHttps([{ status: 200, body: okBody('x') }]);
  const r = await completeWithOpenAI({
    messages: [{ role: 'user', content: 'x'.repeat(30_000) }],
    env: ENV_ON, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(r.failure_kind, 'invalid_request');
  assert.match(r.error, /limit is/);
  assert.equal(m.calls.length, 0);
});

test('25 the output-token cap is bounded regardless of the caller', async () => {
  const m = mockHttps([{ status: 200, body: okBody('x') }]);
  await completeWithOpenAI({ messages: MSG, env: ENV_ON, maxOutputTokens: 999_999, httpsImpl: m, sleepImpl: noSleep });
  assert.ok(JSON.parse(m.calls[0].body).max_output_tokens <= 4000, 'a caller must not raise the ceiling');

  const m2 = mockHttps([{ status: 200, body: okBody('x') }]);
  await completeWithOpenAI({ messages: MSG, env: ENV_ON, maxOutputTokens: -5, httpsImpl: m2, sleepImpl: noSleep });
  assert.ok(JSON.parse(m2.calls[0].body).max_output_tokens > 0, 'a nonsense cap falls back to the default');
});

test('26 a per-attempt timeout is always set on the request', async () => {
  const m = mockHttps([{ status: 200, body: okBody('x') }]);
  await completeWithOpenAI({ messages: MSG, env: ENV_ON, timeoutMs: 1234, httpsImpl: m, sleepImpl: noSleep });
  assert.equal(m.calls[0].options.timeout, 1234);
});
