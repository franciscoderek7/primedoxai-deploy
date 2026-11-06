// PROPOSED — webhook-guard.js. Not wired into anything.
// Hardens the PayPal webhook path: fail closed, verify identifiers, reject
// replays, validate the ledger fields before any write.
// Every network dependency is injected, so this is fully testable offline.

const PROCESSED_TTL_MS = 24 * 60 * 60 * 1000;

function createWebhookGuard({ verifySignature, recordPayment, now = Date.now, seen = new Map() } = {}) {
  if (typeof verifySignature !== 'function') throw new Error('verifySignature required');

  function pruneSeen(t) {
    for (const [id, ts] of seen) if (t - ts > PROCESSED_TTL_MS) seen.delete(id);
  }

  // FAIL CLOSED: a missing webhook id is a configuration error, not a pass.
  async function signatureOk(headers, rawBody, env) {
    if (!env.PAYPAL_WEBHOOK_ID) {
      return { ok: false, reason: 'webhook_not_configured' };
    }
    const required = ['paypal-auth-algo','paypal-cert-url','paypal-transmission-id',
                      'paypal-transmission-sig','paypal-transmission-time'];
    for (const h of required) {
      if (!headers[h]) return { ok: false, reason: 'missing_signature_headers' };
    }
    let verified;
    try { verified = await verifySignature(headers, rawBody); }
    catch { return { ok: false, reason: 'verification_error' }; }   // fail closed on throw
    return verified ? { ok: true } : { ok: false, reason: 'invalid_signature' };
  }

  function validateLedgerFields(resource) {
    const amount = resource?.amount?.value;
    const currency = resource?.amount?.currency_code;
    const captureId = resource?.id;
    const orderId = resource?.supplementary_data?.related_ids?.order_id;
    const status = resource?.status;

    if (status !== 'COMPLETED')                 return { ok: false, reason: 'status_not_completed' };
    if (!captureId)                             return { ok: false, reason: 'missing_capture_id' };
    if (!orderId)                               return { ok: false, reason: 'missing_order_id' };
    if (!/^[A-Z]{3}$/.test(currency || ''))     return { ok: false, reason: 'bad_currency' };
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0)          return { ok: false, reason: 'bad_amount' };
    return { ok: true, fields: { captureId, orderId, amount: n, currency, status } };
  }

  async function handle({ headers = {}, rawBody, env = process.env }) {
    const t = now();
    const sig = await signatureOk(headers, rawBody, env);
    if (!sig.ok) return { status: 401, body: { error: 'webhook_rejected' }, reason: sig.reason };

    let event;
    try { event = typeof rawBody === 'string' ? JSON.parse(rawBody)
                : Buffer.isBuffer(rawBody) ? JSON.parse(rawBody.toString('utf8'))
                : rawBody; }
    catch { return { status: 400, body: { error: 'malformed_event' }, reason: 'unparseable' }; }

    const eventId = event?.id;
    if (!eventId) return { status: 400, body: { error: 'malformed_event' }, reason: 'missing_event_id' };

    pruneSeen(t);
    if (seen.has(eventId)) {
      return { status: 200, body: { received: true, duplicate: true }, reason: 'duplicate_event' };
    }

    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      seen.set(eventId, t);
      return { status: 200, body: { received: true }, reason: 'event_type_ignored' };
    }

    const v = validateLedgerFields(event.resource);
    if (!v.ok) return { status: 422, body: { error: 'unprocessable' }, reason: v.reason };

    seen.set(eventId, t);
    if (typeof recordPayment === 'function') await recordPayment(v.fields);
    return { status: 200, body: { received: true, recorded: true }, reason: 'recorded' };
  }

  return { handle, _seen: seen };
}

module.exports = { createWebhookGuard };
