const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'); const os = require('os'); const path = require('path');
const { createWebhookGuard } = require(process.env.GUARD || './webhook-guard-v2.js');
const { createFileStore } = require('./idempotency-store.js');

const H = { 'paypal-auth-algo':'a','paypal-cert-url':'b','paypal-transmission-id':'c',
            'paypal-transmission-sig':'d','paypal-transmission-time':'e' };
const ENV = { PAYPAL_WEBHOOK_ID: 'WH-FICTIONAL' };
const ev = (o={}) => ({ id:'EVT-1', event_type:'PAYMENT.CAPTURE.COMPLETED',
  resource:{ id:'CAP-1', status:'COMPLETED', amount:{value:'500.00',currency_code:'CAD'},
    supplementary_data:{related_ids:{order_id:'ORD-1'}} }, ...o });
const raw = e => Buffer.from(JSON.stringify(e ?? ev()));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'fhi-idem-'));
const mk = (over={}) => {
  const ledger = [];
  const g = createWebhookGuard({
    verifySignature: async () => true,
    store: createFileStore({ dir: tmp() }),
    appendTransaction: async r => { ledger.push(r); },
    ...over });
  return { g, ledger };
};

test('fail closed: webhook id unset -> 401, nothing appended', async () => {
  const { g, ledger } = mk();
  const r = await g.handle({ headers:H, rawBody:raw(), env:{} });
  assert.equal(r.status,401); assert.equal(r.reason,'webhook_not_configured'); assert.equal(ledger.length,0);
});
test('fail closed: verifier throws -> 401', async () => {
  const { g } = mk({ verifySignature: async () => { throw new Error('net'); } });
  assert.equal((await g.handle({headers:H,rawBody:raw(),env:ENV})).reason,'verification_error');
});
test('fail closed: invalid signature -> 401', async () => {
  const { g, ledger } = mk({ verifySignature: async () => false });
  assert.equal((await g.handle({headers:H,rawBody:raw(),env:ENV})).status,401);
  assert.equal(ledger.length,0);
});
test('fail closed: missing signature headers -> verifier never called', async () => {
  let n=0; const { g } = mk({ verifySignature: async()=>{n++;return true;} });
  assert.equal((await g.handle({headers:{},rawBody:raw(),env:ENV})).reason,'missing_signature_headers');
  assert.equal(n,0);
});
test('RAW BODY GUARD: a parsed object is rejected, not verified', async () => {
  const { g } = mk();
  const r = await g.handle({ headers:H, rawBody: ev(), env:ENV });   // object, not bytes
  assert.equal(r.status,401); assert.equal(r.reason,'raw_body_unavailable');
});
test('valid capture -> 200, appended exactly once with verified fields', async () => {
  const { g, ledger } = mk();
  const r = await g.handle({headers:H,rawBody:raw(),env:ENV});
  assert.equal(r.reason,'recorded'); assert.equal(ledger.length,1);
  assert.equal(ledger[0].captureId,'CAP-1'); assert.equal(ledger[0].orderId,'ORD-1');
  assert.equal(ledger[0].amount,500); assert.equal(ledger[0].currency,'CAD');
  assert.equal(ledger[0].event_id,'EVT-1');
});
test('PERSISTENT idempotency: a NEW guard instance still sees the duplicate', async () => {
  const dir = tmp(); const ledger = [];
  const opts = { verifySignature: async()=>true, appendTransaction: async r=>{ledger.push(r);} };
  const g1 = createWebhookGuard({ ...opts, store: createFileStore({dir}) });
  await g1.handle({headers:H,rawBody:raw(),env:ENV});
  const g2 = createWebhookGuard({ ...opts, store: createFileStore({dir}) });   // fresh process
  const r = await g2.handle({headers:H,rawBody:raw(),env:ENV});
  assert.equal(r.reason,'duplicate_event');
  assert.equal(ledger.length,1,'a restart must not double-credit the ledger');
});
test('RETRYABLE: a failed ledger write releases the claim and does NOT report success', async () => {
  const dir = tmp(); let attempts=0; const ledger=[];
  const store = createFileStore({dir});
  const g = createWebhookGuard({ verifySignature: async()=>true, store,
    appendTransaction: async r => { attempts++; if(attempts===1) throw new Error('db down'); ledger.push(r); } });
  const r1 = await g.handle({headers:H,rawBody:raw(),env:ENV});
  assert.equal(r1.status,500); assert.equal(r1.reason,'ledger_failed_retryable');
  assert.equal(ledger.length,0,'nothing recorded');
  assert.equal(store.state('EVT-1'),null,'claim must be released, not left as processed');
  const r2 = await g.handle({headers:H,rawBody:raw(),env:ENV});   // PayPal redelivers
  assert.equal(r2.reason,'recorded'); assert.equal(ledger.length,1,'retry succeeds');
});
test('no false success: a 500 response never says recorded', async () => {
  const { g } = mk({ appendTransaction: async()=>{ throw new Error('x'); } });
  const r = await g.handle({headers:H,rawBody:raw(),env:ENV});
  assert.notEqual(r.body.recorded,true); assert.equal(r.body.error,'ledger_write_failed');
});
test('concurrent delivery: second gets 409, ledger written once', async () => {
  const dir = tmp(); const ledger=[]; let release;
  const hold = new Promise(r => { release = r; });
  const store = createFileStore({dir});
  const g = createWebhookGuard({ verifySignature: async()=>true, store,
    appendTransaction: async r => { await hold; ledger.push(r); } });
  const p1 = g.handle({headers:H,rawBody:raw(),env:ENV});
  const r2 = await g.handle({headers:H,rawBody:raw(),env:ENV});
  assert.equal(r2.status,409); assert.equal(r2.reason,'claim_held');
  release(); await p1;
  assert.equal(ledger.length,1);
});
test('stale lease is retryable after the lease expires', async () => {
  const dir = tmp(); let t = 1_000_000;
  const store = createFileStore({ dir, leaseMs: 1000, now: () => t });
  assert.equal(store.claim('E'),'claimed');
  assert.equal(store.claim('E'),'in_progress');
  t += 2000;
  assert.equal(store.claim('E'),'claimed','a dead worker must not block forever');
});
test('unprocessable events never consume an event id', async () => {
  const dir = tmp(); const store = createFileStore({dir});
  const g = createWebhookGuard({ verifySignature: async()=>true, store,
                                 appendTransaction: async()=>{} });
  const bad = ev(); bad.resource.status='PENDING';
  assert.equal((await g.handle({headers:H,rawBody:raw(bad),env:ENV})).status,422);
  assert.equal(store.state('EVT-1'),null,'id must stay available for a corrected redelivery');
});
test('field validation: status, capture id, order id, currency, amount', async () => {
  const { g } = mk();
  const cases = [
    [e=>{e.resource.status='PENDING';}, 'status_not_completed'],
    [e=>{delete e.resource.id;},        'missing_capture_id'],
    [e=>{delete e.resource.supplementary_data;}, 'missing_order_id'],
    [e=>{e.resource.amount.currency_code='DOLLARS';}, 'bad_currency'],
    [e=>{e.resource.amount.value='-5';}, 'bad_amount'],
    [e=>{e.resource.amount.value='1e3';}, 'bad_amount'],
    [e=>{e.resource.amount.value=' 5 ';}, 'bad_amount'],
    [e=>{e.resource.amount.value=500;},  'bad_amount'],
  ];
  for (const [mut, reason] of cases) {
    const e = ev(); mut(e);
    assert.equal((await g.handle({headers:H,rawBody:raw(e),env:ENV})).reason, reason, reason);
  }
});
test('out-of-order negative events are noted, never credited', async () => {
  const { g, ledger } = mk();
  for (const t of ['PAYMENT.CAPTURE.DENIED','PAYMENT.CAPTURE.REVERSED','PAYMENT.CAPTURE.REFUNDED']) {
    const r = await g.handle({headers:H,rawBody:raw(ev({event_type:t})),env:ENV});
    assert.equal(r.status,200); assert.equal(r.reason,'negative_event_noted');
  }
  assert.equal(ledger.length,0);
});
test('malformed body and missing event id -> 400, no internal message leaked', async () => {
  const { g } = mk();
  const a = await g.handle({headers:H,rawBody:Buffer.from('{nope'),env:ENV});
  assert.equal(a.status,400); assert.deepEqual(a.body,{error:'malformed_event'});
  const b = await g.handle({headers:H,rawBody:raw(ev({id:undefined})),env:ENV});
  assert.equal(b.reason,'missing_event_id');
});
test('APPEND-ONLY: two different captures both recorded, neither overwrites', async () => {
  const dir = tmp(); const ledger=[];
  const g = createWebhookGuard({ verifySignature: async()=>true, store:createFileStore({dir}),
    appendTransaction: async r=>{ledger.push(r);} });
  await g.handle({headers:H,rawBody:raw(ev()),env:ENV});
  const second = ev({id:'EVT-2'}); second.resource.id='CAP-2';
  second.resource.supplementary_data.related_ids.order_id='ORD-2';
  await g.handle({headers:H,rawBody:raw(second),env:ENV});
  assert.equal(ledger.length,2,'the same customer paying twice must yield TWO rows');
  assert.deepEqual(ledger.map(r=>r.captureId),['CAP-1','CAP-2']);
});
