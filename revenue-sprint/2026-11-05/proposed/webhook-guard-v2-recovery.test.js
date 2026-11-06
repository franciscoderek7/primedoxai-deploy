const test=require('node:test'); const assert=require('node:assert/strict');
const fs=require('fs'),os=require('os'),path=require('path');
const {createWebhookGuard}=require('./webhook-guard-v2.js');
const {createFileStore}=require('./idempotency-store.js');
const H={'paypal-auth-algo':'a','paypal-cert-url':'b','paypal-transmission-id':'c','paypal-transmission-sig':'d','paypal-transmission-time':'e'};
const ENV={PAYPAL_WEBHOOK_ID:'WH-FICTIONAL'};
const ev=(o={},cap='CAP-1')=>({id:'EVT-1',event_type:'PAYMENT.CAPTURE.COMPLETED',
  resource:{id:cap,status:'COMPLETED',amount:{value:'499.00',currency_code:'CAD'},
  supplementary_data:{related_ids:{order_id:'ORD-1'}}},...o});
const raw=e=>Buffer.from(JSON.stringify(e));
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'fhi-x-'));

test('appendTransaction is MANDATORY — constructing without it throws', () => {
  assert.throws(()=>createWebhookGuard({verifySignature:async()=>true,store:createFileStore({dir:tmp()})}),
    /appendTransaction required/);
});

test('DB UNIQUE violation => 200 already_in_ledger, claim committed, no duplicate row', async () => {
  const ledger=[]; const store=createFileStore({dir:tmp()});
  const g=createWebhookGuard({verifySignature:async()=>true,store,
    appendTransaction:async()=>{ const e=new Error('duplicate key'); e.code='23505'; throw e; }});
  const r=await g.handle({headers:H,rawBody:raw(ev()),env:ENV});
  assert.equal(r.status,200); assert.equal(r.reason,'already_in_ledger');
  assert.equal(store.state('EVT-1'),'done','drift must resolve to done, not endless retry');
  assert.equal(ledger.length,0);
});

test('CRASH after append, before commit: claim is stale -> retry, DB UNIQUE stops a second row', async () => {
  const dir=tmp(); let t=1e6; const rows=new Set();
  const store=createFileStore({dir,leaseMs:1000,now:()=>t});
  const append=async r=>{ if(rows.has(r.captureId)){const e=new Error('dup');e.code='23505';throw e;} rows.add(r.captureId); };
  // first attempt: simulate a crash by claiming then dying before commit
  assert.equal(store.claim('EVT-1'),'claimed');
  await append({captureId:'CAP-1'});            // row IS written
  // process dies here: no commit
  t+=2000;                                       // lease expires
  const g=createWebhookGuard({verifySignature:async()=>true,store,appendTransaction:append});
  const r=await g.handle({headers:H,rawBody:raw(ev()),env:ENV});
  assert.equal(r.reason,'already_in_ledger','DB uniqueness is the backstop');
  assert.equal(rows.size,1,'exactly one ledger row survives a crash');
});

test('EXPIRED lease while the original worker still runs: DB uniqueness prevents a double row', async () => {
  const dir=tmp(); let t=1e6; const rows=new Set(); let release;
  const hold=new Promise(r=>{release=r;});
  const store=createFileStore({dir,leaseMs:1000,now:()=>t});
  const append=async r=>{ if(rows.has(r.captureId)){const e=new Error('dup');e.code='23505';throw e;} rows.add(r.captureId); };
  const slow=createWebhookGuard({verifySignature:async()=>true,store,
    appendTransaction:async r=>{ await hold; return append(r); }});
  const p1=slow.handle({headers:H,rawBody:raw(ev()),env:ENV});
  // let the first worker reach store.claim() BEFORE the clock moves, otherwise
  // the lease is not yet held and 409 is the correct answer.
  while (store.state('EVT-1') !== 'claimed') await new Promise(r=>setImmediate(r));
  t+=2000;                                        // NOW the lease expires mid-flight
  const g2=createWebhookGuard({verifySignature:async()=>true,store,appendTransaction:append});
  const r2=await g2.handle({headers:H,rawBody:raw(ev()),env:ENV});   // takes over the stale claim
  release(); await p1;
  assert.equal(rows.size,1,'the DB, not the filesystem, is the final guarantee');
  assert.ok(['recorded','already_in_ledger'].includes(r2.reason));
});

test('DUPLICATE capture id under a DIFFERENT event id is stopped by the DB', async () => {
  const dir=tmp(); const rows=new Set();
  const append=async r=>{ if(rows.has(r.captureId)){const e=new Error('dup');e.code='23505';throw e;} rows.add(r.captureId); };
  const g=createWebhookGuard({verifySignature:async()=>true,store:createFileStore({dir}),appendTransaction:append});
  const a=await g.handle({headers:H,rawBody:raw(ev()),env:ENV});
  assert.equal(a.reason,'recorded');
  const b=await g.handle({headers:H,rawBody:raw(ev({id:'EVT-2'})),env:ENV});  // new event, SAME capture
  assert.equal(b.reason,'already_in_ledger','capture_id UNIQUE is what catches this');
  assert.equal(rows.size,1,'one capture must never yield two revenue rows');
});

test('REFUND preserves the original payment row rather than overwriting it', async () => {
  const dir=tmp(); const ledger=[];
  const g=createWebhookGuard({verifySignature:async()=>true,store:createFileStore({dir}),
    appendTransaction:async r=>{ledger.push(r);}});
  await g.handle({headers:H,rawBody:raw(ev()),env:ENV});
  const refund=await g.handle({headers:H,rawBody:raw(ev({id:'EVT-R',event_type:'PAYMENT.CAPTURE.REFUNDED'})),env:ENV});
  assert.equal(refund.reason,'negative_event_noted');
  assert.equal(ledger.length,1,'the original payment row is untouched');
  assert.equal(ledger[0].amount,499,'original amount preserved');
});

test('OUT-OF-ORDER: refund arriving BEFORE the capture never creates revenue', async () => {
  const dir=tmp(); const ledger=[];
  const g=createWebhookGuard({verifySignature:async()=>true,store:createFileStore({dir}),
    appendTransaction:async r=>{ledger.push(r);}});
  const first=await g.handle({headers:H,rawBody:raw(ev({id:'EVT-R',event_type:'PAYMENT.CAPTURE.REVERSED'})),env:ENV});
  assert.equal(first.reason,'negative_event_noted'); assert.equal(ledger.length,0);
  const then=await g.handle({headers:H,rawBody:raw(ev()),env:ENV});
  assert.equal(then.reason,'recorded'); assert.equal(ledger.length,1);
});

test('CONCURRENT claims across SEPARATE store instances (separate processes)', async () => {
  const dir=tmp(); const rows=new Set();
  const append=async r=>{ if(rows.has(r.captureId)){const e=new Error('dup');e.code='23505';throw e;} rows.add(r.captureId); };
  const mk=()=>createWebhookGuard({verifySignature:async()=>true,store:createFileStore({dir}),appendTransaction:append});
  const results=await Promise.all([mk(),mk(),mk()].map(g=>g.handle({headers:H,rawBody:raw(ev()),env:ENV})));
  assert.equal(rows.size,1,'three processes, one ledger row');
  assert.equal(results.filter(r=>r.reason==='recorded').length,1,'exactly one records');
});
