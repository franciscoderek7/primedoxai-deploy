// PROPOSED v2 — webhook-guard-v2.js. NOT wired to any live payment path.
// Fixes three flaws in v1: in-memory replay cache -> persistent atomic store;
// a failed ledger write no longer marks the event processed; append-only
// transaction history instead of an upsert.
const CAPTURE_COMPLETED = 'PAYMENT.CAPTURE.COMPLETED';
const TERMINAL_NEGATIVE = new Set([
  'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REVERSED', 'PAYMENT.CAPTURE.REFUNDED',
]);

function createWebhookGuard({ verifySignature, store, appendTransaction, now = Date.now } = {}) {
  if (typeof verifySignature !== 'function') throw new Error('verifySignature required');
  if (!store || typeof store.claim !== 'function') throw new Error('persistent store required');
  // MANDATORY: a guard with no ledger sink would 200 a payment it never recorded.
  if (typeof appendTransaction !== 'function') throw new Error('appendTransaction required');

  const SIG_HEADERS = ['paypal-auth-algo', 'paypal-cert-url', 'paypal-transmission-id',
                       'paypal-transmission-sig', 'paypal-transmission-time'];

  async function signatureOk(headers, rawBody, env) {
    // FAIL CLOSED: an unset webhook id is a configuration error, never a pass.
    if (!env.PAYPAL_WEBHOOK_ID) return { ok: false, reason: 'webhook_not_configured' };
    for (const h of SIG_HEADERS) {
      if (!headers[h]) return { ok: false, reason: 'missing_signature_headers' };
    }
    // The raw body must be bytes. A parsed object means middleware consumed it
    // upstream and the signature cannot be checked against what was sent.
    if (!Buffer.isBuffer(rawBody) && typeof rawBody !== 'string') {
      return { ok: false, reason: 'raw_body_unavailable' };
    }
    let verified;
    try { verified = await verifySignature(headers, rawBody); }
    catch { return { ok: false, reason: 'verification_error' }; }
    return verified ? { ok: true } : { ok: false, reason: 'invalid_signature' };
  }

  function validate(resource) {
    const captureId = resource?.id;
    const orderId   = resource?.supplementary_data?.related_ids?.order_id;
    const currency  = resource?.amount?.currency_code;
    const status    = resource?.status;
    const raw       = resource?.amount?.value;

    if (status !== 'COMPLETED')              return { ok: false, reason: 'status_not_completed' };
    if (!captureId)                          return { ok: false, reason: 'missing_capture_id' };
    if (!orderId)                            return { ok: false, reason: 'missing_order_id' };
    if (!/^[A-Z]{3}$/.test(currency || ''))  return { ok: false, reason: 'bad_currency' };
    // Reject anything that is not a plain decimal amount: Number() would
    // happily accept '1e3', ' 5 ', '0x10' and Infinity.
    if (typeof raw !== 'string' || !/^\d{1,9}(\.\d{1,2})?$/.test(raw))
                                             return { ok: false, reason: 'bad_amount' };
    const amount = Number(raw);
    if (!(amount > 0))                       return { ok: false, reason: 'bad_amount' };
    return { ok: true, fields: { captureId, orderId, amount, currency, status } };
  }

  async function handle({ headers = {}, rawBody, env = process.env }) {
    const sig = await signatureOk(headers, rawBody, env);
    if (!sig.ok) return { status: 401, body: { error: 'webhook_rejected' }, reason: sig.reason };

    let event;
    try {
      const text = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
      event = JSON.parse(text);
    } catch { return { status: 400, body: { error: 'malformed_event' }, reason: 'unparseable' }; }

    const eventId = event?.id;
    if (!eventId || typeof eventId !== 'string') {
      return { status: 400, body: { error: 'malformed_event' }, reason: 'missing_event_id' };
    }

    // Non-crediting events are acknowledged but never recorded as revenue.
    if (event.event_type !== CAPTURE_COMPLETED) {
      const negative = TERMINAL_NEGATIVE.has(event.event_type);
      return { status: 200, body: { received: true },
               reason: negative ? 'negative_event_noted' : 'event_type_ignored' };
    }

    // Validate BEFORE claiming, so an unprocessable event never consumes an id.
    const v = validate(event.resource);
    if (!v.ok) return { status: 422, body: { error: 'unprocessable' }, reason: v.reason };

    const claim = store.claim(eventId);
    if (claim === 'duplicate') {
      return { status: 200, body: { received: true, duplicate: true }, reason: 'duplicate_event' };
    }
    if (claim === 'in_progress') {
      // Another delivery holds a fresh lease. 409 asks PayPal to retry later.
      return { status: 409, body: { error: 'in_progress' }, reason: 'claim_held' };
    }

    try {
      await appendTransaction({ ...v.fields, event_id: eventId, recorded_at: new Date(now()).toISOString() });
    } catch (e) {
      // A database UNIQUE violation on capture_id/event_id means the row is
      // ALREADY recorded: the claim store and the database had drifted. That is
      // a success for idempotency purposes, not a retry.
      if (e && (e.code === '23505' || e.duplicate === true)) {
        store.commit(eventId);
        return { status: 200, body: { received: true, duplicate: true }, reason: 'already_in_ledger' };
      }
      // CRITICAL: release the claim so a later delivery can retry. Never
      // report success for a payment that was not recorded.
      store.release(eventId);
      return { status: 500, body: { error: 'ledger_write_failed' }, reason: 'ledger_failed_retryable' };
    }

    store.commit(eventId);
    return { status: 200, body: { received: true, recorded: true }, reason: 'recorded' };
  }

  return { handle };
}

module.exports = { createWebhookGuard };
