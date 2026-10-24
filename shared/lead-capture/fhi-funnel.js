/*
 * fhi-funnel.js — Francisco Holdings Inc. commercial funnel measurement
 *
 * WHY: no analytics of any kind exists in this repository. A repo-wide search
 * for gtag / googletagmanager / a G-XXXXXXX id returns ZERO files across every
 * site. So nothing is currently measured, and no claim about traffic or
 * conversion is presently supportable by data.
 *
 * DESIGN RULES, enforced by the stage model below rather than by convention:
 *  - A click is not a lead. A lead is not a sale. An initiated payment is not
 *    collected revenue. Each is a separate stage and the module refuses to
 *    record revenue against anything but a confirmed collection.
 *  - No personal information leaves the page. Name, email, organisation and
 *    free text are never sent. Only a random lead id, stage, and coarse
 *    non-identifying facts.
 *  - Nothing is reported as "active" until a real provider is configured and
 *    its delivery verified. Until then events queue locally and `status()`
 *    says so.
 */
(function (global) {
  'use strict';

  // Ordered, and deliberately not collapsible. Index = how far down the funnel.
  var STAGES = [
    'visit',             // a page view
    'cta_view',          // a call to action became visible
    'cta_click',         // a call to action was clicked — NOT a lead
    'form_start',        // the enquiry form was begun
    'lead_submitted',    // intake returned 'received' — NOT a sale
    'lead_qualified',    // a human judged it a real opportunity
    'payment_initiated', // a payment was started — NOT revenue
    'revenue_collected'  // funds confirmed received — the only revenue stage
  ];

  var CONFIG = {
    PROVIDER: null,          // null until a real analytics provider is wired
    MEASUREMENT_ID: '',      // set by the deployer; no secret belongs here
    DEBUG: false
  };

  // Fields that may never be transmitted, whatever a caller passes.
  var PII = ['name', 'email', 'phone', 'organisation', 'need', 'address',
             'budget', 'message', 'ip', 'user_agent'];

  var queue = [];

  function cfg(o) { for (var k in (o || {})) if (Object.hasOwn(o, k)) CONFIG[k] = o[k]; return CONFIG; }

  // A lead id lets a submission be followed to revenue WITHOUT storing who it
  // is. It is random, not derived from any personal detail.
  function newLeadId(rand) {
    var r = rand || (global.crypto && global.crypto.randomUUID
      ? function () { return global.crypto.randomUUID(); }
      : function () { return 'lead_' + Math.random().toString(36).slice(2, 12); });
    return String(r());
  }

  // Campaign attribution from the URL only — no cross-site tracking, no cookie.
  function attribution(search, referrer) {
    var p = new URLSearchParams(search || '');
    var out = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
      var v = p.get(k); if (v) out[k] = String(v).slice(0, 80);
    });
    if (!out.utm_source && referrer) {
      try { out.referrer_host = new URL(referrer).hostname; } catch (e) { /* ignore */ }
    }
    return out;
  }

  function stripPII(props) {
    var out = {}, removed = [];
    for (var k in (props || {})) {
      if (!Object.hasOwn(props, k)) continue;
      if (PII.indexOf(k) !== -1) { removed.push(k); continue; }
      var v = props[k];
      if (typeof v === 'string' && /@/.test(v)) { removed.push(k); continue; }  // looks like an address
      out[k] = typeof v === 'string' ? v.slice(0, 120) : v;
    }
    if (removed.length) out._dropped_pii_fields = removed.length;
    return out;
  }

  function track(stage, props, opts) {
    opts = opts || {};
    if (STAGES.indexOf(stage) === -1) {
      return { recorded: false, reason: 'unknown stage: ' + stage };
    }
    // Revenue may only be recorded at the one stage that means collected.
    var amount = props && props.amount_cad;
    if (amount != null && stage !== 'revenue_collected') {
      return { recorded: false, reason: 'amount_cad is only valid on revenue_collected' };
    }
    if (stage === 'revenue_collected') {
      if (typeof amount !== 'number' || !(amount > 0)) {
        return { recorded: false, reason: 'revenue_collected requires a positive numeric amount_cad' };
      }
      if (!props.confirmation_ref) {
        return { recorded: false, reason: 'revenue_collected requires confirmation_ref (proof of collection)' };
      }
    }
    var ev = {
      stage: stage,
      stage_index: STAGES.indexOf(stage),
      at: new Date(opts.now || Date.now()).toISOString(),
      props: stripPII(props)
    };
    queue.push(ev);
    if (CONFIG.DEBUG) (global.console || { log: function () {} }).log('[fhi-funnel]', ev);
    return { recorded: true, event: ev, delivered: false };
  }

  // Honest status. "configured" is not "verified"; only a human who has seen
  // the event arrive in the provider's console may set verified.
  function status() {
    return {
      provider: CONFIG.PROVIDER,
      configured: Boolean(CONFIG.PROVIDER && CONFIG.MEASUREMENT_ID),
      delivery_verified: false,
      queued_events: queue.length,
      note: 'Events are queued locally only. No analytics provider is wired, ' +
            'so no traffic or conversion figure from this module is reportable yet.'
    };
  }

  var API = {
    STAGES: STAGES, PII: PII, config: cfg, track: track, status: status,
    newLeadId: newLeadId, attribution: attribution, stripPII: stripPII,
    drain: function () { var q = queue.slice(); queue.length = 0; return q; },
    peek: function () { return queue.slice(); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.FHIFunnel = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
