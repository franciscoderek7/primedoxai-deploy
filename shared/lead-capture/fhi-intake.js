/*
 * fhi-intake.js — Francisco Holdings Inc. lead intake client
 *
 * WHY THIS EXISTS
 * Every lead form in this repository currently submits via
 * action="mailto:..." (14 forms) or to a Formspree placeholder id
 * (3 forms: "placeholder", "YOURFORMID", "PLACEHOLDER"). A mailto form
 * action hands the data to the visitor's mail client; on mobile and on
 * webmail it usually does nothing at all, and the visitor is never told.
 * A placeholder Formspree id submits to nothing. Neither records the lead,
 * validates it, or confirms receipt. That is the revenue blocker.
 *
 * WHAT THIS DOES
 * Posts the form to ONE configured endpoint and reports only what it can
 * observe. It never tells the visitor their message was sent unless the
 * endpoint returned a success status.
 *
 * WHAT IT DOES NOT DO
 * - It holds no API key, token or secret. The endpoint URL is public by
 *   design; anything privileged belongs behind that endpoint.
 * - It does not validate server-side. A static page cannot. The endpoint
 *   must re-validate everything here; see REQUIRED-ENDPOINT-CONTRACT below.
 * - It does not claim an email was sent. It reports "received" only.
 */
(function (global) {
  'use strict';

  // ── CONFIGURATION ────────────────────────────────────────────────────────
  // Set ENDPOINT once. Until it is set, forms render a visible notice and
  // refuse to submit rather than silently discarding a real enquiry.
  var CONFIG = {
    ENDPOINT: '',                       // e.g. 'https://formspree.io/f/xxxxxxx'
    INTAKE_LABEL: 'FHI diagnostic intake',
    MIN_SECONDS_ON_FORM: 3,             // submissions faster than this are bots
    MAX_FIELD_LENGTH: 4000,
    TIMEOUT_MS: 15000
  };

  var FIELDS = {
    required: ['name', 'email', 'organisation', 'need'],
    optional: ['phone', 'budget', 'timeline', 'source', 'campaign', 'lead_id']
  };

  function cfg(overrides) {
    for (var k in (overrides || {})) if (Object.hasOwn(overrides, k)) CONFIG[k] = overrides[k];
    return CONFIG;
  }

  // ── VALIDATION (client side — the endpoint MUST repeat all of it) ────────
  function validate(data) {
    var errors = {};
    FIELDS.required.forEach(function (f) {
      var v = (data[f] == null ? '' : String(data[f])).trim();
      if (!v) errors[f] = 'required';
      else if (v.length > CONFIG.MAX_FIELD_LENGTH) errors[f] = 'too long';
    });
    var email = (data.email == null ? '' : String(data.email)).trim();
    // Deliberately permissive: a regex that rejects valid addresses loses leads.
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'invalid';
    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  // ── SPAM CONTROLS (no third-party script, no cookie, no tracking) ────────
  function spamCheck(data, openedAt, now) {
    if (data[data.__honeypotField || '_confirm_human']) {
      return { spam: true, reason: 'honeypot filled' };
    }
    var seconds = (now - openedAt) / 1000;
    if (seconds < CONFIG.MIN_SECONDS_ON_FORM) {
      return { spam: true, reason: 'submitted in ' + seconds.toFixed(1) + 's' };
    }
    return { spam: false };
  }

  // Strip anything not on the allow-list, so a tampered form cannot inject
  // extra fields into the intake record.
  function sanitise(data) {
    var out = {};
    FIELDS.required.concat(FIELDS.optional).forEach(function (f) {
      if (data[f] != null && String(data[f]).trim()) {
        out[f] = String(data[f]).trim().slice(0, CONFIG.MAX_FIELD_LENGTH);
      }
    });
    return out;
  }

  // ── SUBMIT ──────────────────────────────────────────────────────────────
  // Resolves { status, detail }. status is one of:
  //   'received'       endpoint returned 2xx — the ONLY success state
  //   'invalid'        client validation failed; nothing was sent
  //   'rejected'       endpoint returned 4xx; the lead was NOT recorded
  //   'unavailable'    endpoint returned 5xx, timed out, or network failed
  //   'not_configured' ENDPOINT is empty; nothing was sent
  //   'discarded'      failed the spam check; nothing was sent
  // There is no state that means "probably sent". That is the point.
  async function submit(data, opts) {
    opts = opts || {};
    var now = opts.now || Date.now();
    var openedAt = opts.openedAt || now;
    var fetchImpl = opts.fetch || global.fetch;

    var spam = spamCheck(data, openedAt, now);
    if (spam.spam) return { status: 'discarded', detail: spam.reason };

    var v = validate(data);
    if (!v.ok) return { status: 'invalid', detail: v.errors };

    if (!CONFIG.ENDPOINT) {
      return {
        status: 'not_configured',
        detail: 'No intake endpoint is configured, so this enquiry was NOT sent ' +
                'and NOT recorded. Set CONFIG.ENDPOINT in fhi-intake.js.'
      };
    }

    var payload = sanitise(data);
    payload._intake = CONFIG.INTAKE_LABEL;
    payload._submitted_at = new Date(now).toISOString();

    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, CONFIG.TIMEOUT_MS) : null;

    try {
      var res = await fetchImpl(CONFIG.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      });
      if (res.status >= 200 && res.status < 300) {
        return { status: 'received', detail: 'endpoint acknowledged with ' + res.status };
      }
      if (res.status >= 400 && res.status < 500) {
        return { status: 'rejected', detail: 'endpoint returned ' + res.status };
      }
      return { status: 'unavailable', detail: 'endpoint returned ' + res.status };
    } catch (e) {
      return { status: 'unavailable', detail: (e && e.name === 'AbortError') ? 'timed out' : 'network error' };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  // Visitor-facing wording. Only 'received' is reassuring, and even that
  // promises a reply rather than asserting an email was delivered.
  var MESSAGES = {
    received:       'Request received. You will get a reply from Francisco Holdings Inc. within one business day.',
    invalid:        'Please check the highlighted fields and try again.',
    rejected:       'That request could not be accepted. Please check your details and try again.',
    unavailable:    'We could not reach our intake service, so your request has NOT been recorded. ' +
                    'Please try again shortly, or email us directly.',
    not_configured: 'Our online intake form is not accepting submissions yet, so this was NOT sent. ' +
                    'Please email us directly.',
    discarded:      'Please check the highlighted fields and try again.'
  };
  function messageFor(status) { return MESSAGES[status] || MESSAGES.unavailable; }

  var API = {
    config: cfg, validate: validate, spamCheck: spamCheck, sanitise: sanitise,
    submit: submit, messageFor: messageFor, FIELDS: FIELDS, MESSAGES: MESSAGES,
    isConfigured: function () { return Boolean(CONFIG.ENDPOINT); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.FHIIntake = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* REQUIRED-ENDPOINT-CONTRACT — the endpoint must, server side:
 *   1. re-validate every required field (never trust this file)
 *   2. record the submission durably BEFORE returning 2xx
 *   3. return 2xx only once recorded; 4xx for bad input; 5xx on its own failure
 *   4. apply rate limiting per IP
 *   5. never echo the submission back in a public response
 *   6. hold any API key itself — never in this file
 */
