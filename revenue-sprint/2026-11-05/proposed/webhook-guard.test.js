const test = require('node:test');
const assert = require('node:assert/strict');
const { createWebhookGuard } = require('./webhook-guard.js');

const HDRS = { 'paypal-auth-algo':'a','paypal-cert-url':'b','paypal-transmission-id':'c',
               'paypal-transmission-sig':'d','paypal-transmission-time':'e' };
const ENV_OK = { PAYPAL_WEBHOOK_ID: 'WH-FICTIONAL-TEST' };
const capture = (over = {}) => ({
  id: 'EVT-1', event_type: 'PAYMENT.CAPTURE.COMPLETED',
  resource: { id: 'CAP-1', status: 'COMPLETED',
    amount: { value: '500.00', currency_code: 'CAD' },
    supplementary_data: { related_ids: { order_id: 'ORD-1' } } },
  ...over });

test('MISSING CONFIG fails closed — 401, and nothing is recorded', async () => {
  let recorded = 0;
  const g = createWebhookGuard({ verifySignature: async () => true,
                                 recordPayment: async () => { recorded++; } });
  const r = await g.handle({ headers: HDRS, rawBody: capture(), env: {} });
  assert.equal(r.status, 401);
  assert.equal(r.reason, 'webhook_not_configured');
  assert.equal(recorded, 0, 'must not record without a configured webhook id');
});

test('INVALID signature → 401, nothing recorded', async () => {
  let recorded = 0;
  const g = createWebhookGuard({ verifySignature: async () => false,
                                 recordPayment: async () => { recorded++; } });
  const r = await g.handle({ headers: HDRS, rawBody: capture(), env: ENV_OK });
  assert.equal(r.status, 401);
  assert.equal(r.reason, 'invalid_signature');
  assert.equal(recorded, 0);
});

test('verifier THROWING fails closed, not open', async () => {
  const g = createWebhookGuard({ verifySignature: async () => { throw new Error('network'); } });
  const r = await g.handle({ headers: HDRS, rawBody: capture(), env: ENV_OK });
  assert.equal(r.status, 401);
  assert.equal(r.reason, 'verification_error');
});

test('missing signature headers → 401 without calling the verifier', async () => {
  let called = 0;
  const g = createWebhookGuard({ verifySignature: async () => { called++; return true; } });
  const r = await g.handle({ headers: {}, rawBody: capture(), env: ENV_OK });
  assert.equal(r.status, 401);
  assert.equal(r.reason, 'missing_signature_headers');
  assert.equal(called, 0);
});

test('VALID signature + valid capture → 200 and recorded once, with verified fields', async () => {
  const got = [];
  const g = createWebhookGuard({ verifySignature: async () => true,
                                 recordPayment: async f => got.push(f) });
  const r = await g.handle({ headers: HDRS, rawBody: capture(), env: ENV_OK });
  assert.equal(r.status, 200);
  assert.equal(r.reason, 'recorded');
  assert.deepEqual(got, [{ captureId:'CAP-1', orderId:'ORD-1', amount:500, currency:'CAD', status:'COMPLETED' }]);
});

test('DUPLICATE event id → 200 but NOT recorded again (replay defence)', async () => {
  let recorded = 0;
  const g = createWebhookGuard({ verifySignature: async () => true,
                                 recordPayment: async () => { recorded++; } });
  await g.handle({ headers: HDRS, rawBody: capture(), env: ENV_OK });
  const r2 = await g.handle({ headers: HDRS, rawBody: capture(), env: ENV_OK });
  assert.equal(r2.status, 200);
  assert.equal(r2.reason, 'duplicate_event');
  assert.equal(recorded, 1, 'a replayed event must not double-credit the ledger');
});

test('status not COMPLETED → 422, nothing recorded', async () => {
  let recorded = 0;
  const g = createWebhookGuard({ verifySignature: async () => true,
                                 recordPayment: async () => { recorded++; } });
  const ev = capture(); ev.resource.status = 'PENDING';
  const r = await g.handle({ headers: HDRS, rawBody: ev, env: ENV_OK });
  assert.equal(r.status, 422); assert.equal(r.reason, 'status_not_completed'); assert.equal(recorded, 0);
});

test('missing order id → 422', async () => {
  const g = createWebhookGuard({ verifySignature: async () => true });
  const ev = capture(); delete ev.resource.supplementary_data;
  const r = await g.handle({ headers: HDRS, rawBody: ev, env: ENV_OK });
  assert.equal(r.status, 422); assert.equal(r.reason, 'missing_order_id');
});

test('bad currency and bad amount are each rejected', async () => {
  const g = createWebhookGuard({ verifySignature: async () => true });
  const a = capture(); a.resource.amount.currency_code = 'DOLLARS';
  assert.equal((await g.handle({ headers: HDRS, rawBody: a, env: ENV_OK })).reason, 'bad_currency');
  const b = capture(); b.resource.amount.value = '-5';
  assert.equal((await g.handle({ headers: HDRS, rawBody: b, env: ENV_OK })).reason, 'bad_amount');
});

test('other event types acknowledged but not recorded', async () => {
  let recorded = 0;
  const g = createWebhookGuard({ verifySignature: async () => true,
                                 recordPayment: async () => { recorded++; } });
  const r = await g.handle({ headers: HDRS, rawBody: capture({ event_type:'PAYMENT.CAPTURE.DENIED' }), env: ENV_OK });
  assert.equal(r.status, 200); assert.equal(r.reason, 'event_type_ignored'); assert.equal(recorded, 0);
});

test('malformed body → 400, no stack trace or internal message leaked', async () => {
  const g = createWebhookGuard({ verifySignature: async () => true });
  const r = await g.handle({ headers: HDRS, rawBody: '{not json', env: ENV_OK });
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: 'malformed_event' });
});

test('raw Buffer body is accepted', async () => {
  const g = createWebhookGuard({ verifySignature: async () => true });
  const r = await g.handle({ headers: HDRS, rawBody: Buffer.from(JSON.stringify(capture())), env: ENV_OK });
  assert.equal(r.status, 200); assert.equal(r.reason, 'recorded');
});
