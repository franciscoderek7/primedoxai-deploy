/* payment-ui.js — Francisco Holdings Empire Shared Payment UI Component
 * Self-contained vanilla JS. No frameworks. No external dependencies.
 *
 * Palette:
 *   Primary   #D4AF37  (gold)
 *   Secondary #10B981  (emerald)
 *   BG        rgba(0,0,0,0.92)
 *   Text      #EEEEEE
 *
 * Exposes:
 *   window.EmpireReferral   — referral code system
 *   window.EmpireDiscount   — discount tier selector panel
 *   window.EmpirePayment    — payment button renderer
 *   window.TimmyBadge       — Timmy AI badge injector
 *
 * Auto-runs on DOMContentLoaded:
 *   - Applies ?ref= from URL
 *   - Injects Stripe-unavailable banner if window.STRIPE_UNAVAILABLE === true
 *   - Injects Timmy badge if window.TIMMY_ACTIVE === true
 *   - Injects discount panel always
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   * SHARED CONSTANTS
   * ───────────────────────────────────────────────────────────────────────── */
  var GOLD    = '#D4AF37';
  var EMERALD = '#10B981';
  var BG      = 'rgba(0,0,0,0.92)';
  var TEXT    = '#EEEEEE';
  var DIM     = 'rgba(212,175,55,0.15)';

  var LS_REFERRAL = 'empire_referral';
  var LS_DISCOUNT = 'empire_discount';

  /* ─────────────────────────────────────────────────────────────────────────
   * UTILITY: inject a <style> block once
   * ───────────────────────────────────────────────────────────────────────── */
  function injectStyle(id, css) {
    if (document.getElementById(id)) { return; }
    var s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }


  /* ═════════════════════════════════════════════════════════════════════════
   * 1. REFERRAL CODE SYSTEM
   * ═════════════════════════════════════════════════════════════════════════ */

  window.EmpireReferral = (function () {

    /* Generate a referral code: REF-[INITIALS]-[RANDOM4]
     * initials: optional 2-letter string (defaults to random) */
    function generate(initials) {
      var letters = (initials || _randomInitials()).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      if (letters.length < 2) { letters = _randomInitials(); }
      var digits  = Math.floor(1000 + Math.random() * 9000);
      return 'REF-' + letters + '-' + digits;
    }

    function _randomInitials() {
      var alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      return alpha[Math.floor(Math.random() * alpha.length)] +
             alpha[Math.floor(Math.random() * alpha.length)];
    }

    /* Validate + store a referral code */
    function apply(code) {
      if (!code || typeof code !== 'string') { return false; }
      var clean = code.trim().toUpperCase();
      if (!/^REF-[A-Z]{2}-\d{4}$/.test(clean)) { return false; }
      localStorage.setItem(LS_REFERRAL, clean);
      return true;
    }

    /* Get the active referral discount (5% if code stored, else 0) */
    function getDiscount() {
      return localStorage.getItem(LS_REFERRAL) ? 5 : 0;
    }

    /* Render referral input box into a container element */
    function renderInput(container) {
      injectStyle('empire-ref-style', [
        '.empire-ref-box{font-family:system-ui,sans-serif;background:' + BG + ';border:1px solid ' + GOLD + ';border-radius:8px;padding:14px 18px;margin:12px 0;color:' + TEXT + ';max-width:360px;}',
        '.empire-ref-box label{display:block;font-size:13px;color:' + GOLD + ';margin-bottom:8px;letter-spacing:0.04em;}',
        '.empire-ref-box .ref-row{display:flex;gap:8px;}',
        '.empire-ref-box input{flex:1;background:rgba(255,255,255,0.07);border:1px solid ' + GOLD + ';border-radius:5px;color:' + TEXT + ';padding:7px 10px;font-size:14px;outline:none;}',
        '.empire-ref-box input::placeholder{color:rgba(238,238,238,0.35);}',
        '.empire-ref-box button{background:' + GOLD + ';color:#000;border:none;border-radius:5px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer;}',
        '.empire-ref-box .ref-msg{margin-top:7px;font-size:12px;min-height:16px;}',
        '.empire-ref-box .ref-msg.ok{color:' + EMERALD + ';}',
        '.empire-ref-box .ref-msg.err{color:#F87171;}',
      ].join(''));

      var stored = localStorage.getItem(LS_REFERRAL);
      var el = document.createElement('div');
      el.className = 'empire-ref-box';
      el.innerHTML = [
        '<label>Have a referral code? Enter it for 5% off</label>',
        '<div class="ref-row">',
        '  <input type="text" id="empire-ref-input" placeholder="REF-AB-1234" maxlength="12" value="' + (stored || '') + '">',
        '  <button id="empire-ref-apply">Apply</button>',
        '</div>',
        '<div class="ref-msg" id="empire-ref-msg">' + (stored ? '&#10003; Code applied — 5% discount active' : '') + '</div>',
      ].join('');
      container.appendChild(el);

      el.querySelector('#empire-ref-apply').addEventListener('click', function () {
        var val = el.querySelector('#empire-ref-input').value;
        var msg = el.querySelector('#empire-ref-msg');
        if (window.EmpireReferral.apply(val)) {
          msg.textContent = '✓ Code applied — 5% discount active';
          msg.className   = 'ref-msg ok';
          _broadcastDiscountUpdate();
        } else {
          msg.textContent = 'Invalid code format. Expected REF-XX-0000';
          msg.className   = 'ref-msg err';
        }
      });
    }

    return { generate: generate, apply: apply, getDiscount: getDiscount, renderInput: renderInput };
  })();


  /* ═════════════════════════════════════════════════════════════════════════
   * 2. DISCOUNT TIER SELECTOR (floating panel)
   * ═════════════════════════════════════════════════════════════════════════ */

  window.EmpireDiscount = (function () {

    var MAX_TOTAL = 30; // maximum combined discount %

    var TIERS = [
      { key: 'senior',   label: 'Senior (65+)',       pct: 15, badge: '🌿 Elder',     always: true },
      { key: 'veteran',  label: 'Veteran',             pct: 20, badge: '⚔ Valor',           always: true },
      { key: 'terminal', label: 'Terminal Illness',    pct: 25, badge: '🔥 Phoenix',   always: false }, // cannabis sites only
      { key: 'fixed',    label: 'Fixed Income',        pct: 10, badge: '💪 Resilience',always: true },
    ];

    /* Load stored discounts */
    function _load() {
      try { return JSON.parse(localStorage.getItem(LS_DISCOUNT)) || {}; }
      catch (e) { return {}; }
    }

    /* Save discounts */
    function _save(obj) {
      localStorage.setItem(LS_DISCOUNT, JSON.stringify(obj));
    }

    /* Compute total discount (tiers + referral), capped at MAX_TOTAL */
    function getTotal() {
      var active = _load();
      var tierPct = 0;
      TIERS.forEach(function (t) {
        if (active[t.key]) { tierPct += t.pct; }
      });
      var refPct = window.EmpireReferral ? window.EmpireReferral.getDiscount() : 0;
      return Math.min(tierPct + refPct, MAX_TOTAL);
    }

    /* Inject the floating panel */
    function inject() {
      if (document.getElementById('empire-discount-panel')) { return; }

      var isCannabis = (window.LOOP_TAG === 'A_CANNABIS');

      injectStyle('empire-discount-style', [
        '#empire-discount-panel{position:fixed;bottom:24px;right:24px;z-index:9998;font-family:system-ui,sans-serif;width:260px;background:' + BG + ';border:1px solid ' + GOLD + ';border-radius:10px;color:' + TEXT + ';box-shadow:0 4px 32px rgba(0,0,0,0.6);transition:transform 0.25s ease;}',
        '#empire-discount-panel.minimized .edp-body{display:none;}',
        '#empire-discount-panel.minimized{width:auto;}',
        '.edp-header{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid rgba(212,175,55,0.25);cursor:pointer;user-select:none;}',
        '.edp-header span{font-size:13px;font-weight:700;color:' + GOLD + ';letter-spacing:0.05em;}',
        '.edp-toggle{background:none;border:none;color:' + GOLD + ';font-size:16px;cursor:pointer;line-height:1;padding:0;}',
        '.edp-body{padding:12px 14px;}',
        '.edp-trust{font-size:11px;color:rgba(238,238,238,0.45);margin-bottom:10px;}',
        '.edp-tier{display:flex;align-items:center;gap:9px;margin-bottom:8px;}',
        '.edp-tier input[type=checkbox]{accent-color:' + GOLD + ';width:15px;height:15px;cursor:pointer;flex-shrink:0;}',
        '.edp-tier label{font-size:13px;color:' + TEXT + ';cursor:pointer;display:flex;align-items:center;gap:5px;}',
        '.edp-badge{font-size:11px;background:' + DIM + ';border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:2px 6px;color:' + GOLD + ';}',
        '.edp-total{margin-top:11px;padding-top:9px;border-top:1px solid rgba(212,175,55,0.2);font-size:13px;color:' + EMERALD + ';font-weight:700;}',
      ].join(''));

      var active = _load();

      var tiersHtml = TIERS.filter(function (t) {
        return t.always || (t.key === 'terminal' && isCannabis);
      }).map(function (t) {
        var chk = active[t.key] ? 'checked' : '';
        return [
          '<div class="edp-tier">',
          '  <input type="checkbox" id="edp-' + t.key + '" data-key="' + t.key + '" data-pct="' + t.pct + '" ' + chk + '>',
          '  <label for="edp-' + t.key + '">' + t.label + ' <span class="edp-badge">' + t.badge + '</span> &mdash; ' + t.pct + '% off</label>',
          '</div>',
        ].join('');
      }).join('');

      var panel = document.createElement('div');
      panel.id = 'empire-discount-panel';
      panel.innerHTML = [
        '<div class="edp-header" id="edp-header-row">',
        '  <span>&#9733; Your Discounts</span>',
        '  <button class="edp-toggle" id="edp-toggle-btn" title="Minimize">&#8722;</button>',
        '</div>',
        '<div class="edp-body">',
        '  <div class="edp-trust">We trust you &mdash; honor system</div>',
        tiersHtml,
        '  <div class="edp-total" id="edp-total-display">Your discount: ' + getTotal() + '%</div>',
        '</div>',
      ].join('');
      document.body.appendChild(panel);

      /* Minimize / expand */
      document.getElementById('edp-toggle-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        var minimized = panel.classList.toggle('minimized');
        this.textContent = minimized ? '+' : '−';
      });

      /* Checkbox changes */
      panel.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
        cb.addEventListener('change', function () {
          var cur = _load();
          cur[this.dataset.key] = this.checked;
          _save(cur);
          _refreshTotal();
          _broadcastDiscountUpdate();
        });
      });

      function _refreshTotal() {
        var el = document.getElementById('edp-total-display');
        if (el) { el.textContent = 'Your discount: ' + getTotal() + '%'; }
      }
    }

    return { getTotal: getTotal, inject: inject };
  })();


  /* ─────────────────────────────────────────────────────────────────────────
   * Internal broadcast: notify any rendered price displays to refresh
   * ───────────────────────────────────────────────────────────────────────── */
  function _broadcastDiscountUpdate() {
    document.querySelectorAll('[data-empire-price]').forEach(function (el) {
      var base    = parseFloat(el.dataset.empirePrice);
      var pct     = window.EmpireDiscount.getTotal();
      var final   = (base * (1 - pct / 100)).toFixed(2);
      el.textContent = '$' + final + (pct > 0 ? ' (' + pct + '% off)' : '');
    });
    // also refresh discount panel total label
    var totalEl = document.getElementById('edp-total-display');
    if (totalEl) { totalEl.textContent = 'Your discount: ' + window.EmpireDiscount.getTotal() + '%'; }
  }


  /* ═════════════════════════════════════════════════════════════════════════
   * 3. STRIPE UNAVAILABLE BANNER
   * ═════════════════════════════════════════════════════════════════════════ */

  function injectStripeBanner() {
    if (document.getElementById('empire-stripe-banner')) { return; }

    injectStyle('empire-banner-style', [
      '#empire-stripe-banner{position:relative;width:100%;background:linear-gradient(90deg,#7B6000,#D4AF37,#7B6000);color:#000;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;text-align:center;padding:11px 44px;box-sizing:border-box;z-index:10000;letter-spacing:0.01em;}',
      '#empire-stripe-banner .esb-close{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:20px;cursor:pointer;color:#000;line-height:1;padding:0 4px;}',
    ].join(''));

    var banner  = document.createElement('div');
    banner.id   = 'empire-stripe-banner';
    banner.innerHTML = [
      '⚡ Stripe checkout temporarily unavailable. PayPal and Interac e-Transfer are fully operational. Stripe will be restored shortly.',
      '<button class="esb-close" id="esb-close-btn" aria-label="Dismiss">&times;</button>',
    ].join('');

    document.body.insertBefore(banner, document.body.firstChild);

    document.getElementById('esb-close-btn').addEventListener('click', function () {
      banner.style.display = 'none';
      sessionStorage.setItem('empire_stripe_banner_dismissed', '1');
    });
  }


  /* ═════════════════════════════════════════════════════════════════════════
   * 4. PAYMENT BUTTON RENDERER
   * ═════════════════════════════════════════════════════════════════════════ */

  window.EmpirePayment = (function () {

    injectStyle('empire-payment-style', [
      '.empire-payment-wrap{font-family:system-ui,sans-serif;background:' + BG + ';border:1px solid ' + GOLD + ';border-radius:10px;padding:20px;max-width:400px;color:' + TEXT + ';}',
      '.empire-payment-wrap h4{margin:0 0 4px;color:' + GOLD + ';font-size:15px;letter-spacing:0.05em;}',
      '.empire-payment-wrap .ep-amount{font-size:24px;font-weight:800;color:' + TEXT + ';margin:0 0 16px;}',
      '.empire-payment-wrap .ep-amount small{font-size:13px;font-weight:400;color:rgba(238,238,238,0.55);}',
      '.ep-btn{display:block;width:100%;padding:13px;border-radius:7px;font-size:15px;font-weight:700;cursor:pointer;text-align:center;text-decoration:none;border:none;margin-bottom:10px;box-sizing:border-box;transition:opacity 0.15s;}',
      '.ep-btn:hover{opacity:0.85;}',
      '.ep-btn-paypal{background:#FFC439;color:#003087;}',
      '.ep-btn-paypal-inquiry{background:' + GOLD + ';color:#000;}',
      '.ep-btn-interac{background:' + EMERALD + ';color:#fff;}',
      '.ep-btc-toggle{background:none;border:1px solid rgba(212,175,55,0.4);color:' + GOLD + ';width:100%;padding:10px;border-radius:7px;font-size:13px;cursor:pointer;margin-bottom:0;}',
      '.ep-btc-panel{display:none;background:rgba(212,175,55,0.07);border:1px solid rgba(212,175,55,0.25);border-radius:7px;padding:12px;margin-top:8px;font-size:12px;color:rgba(238,238,238,0.7);word-break:break-all;}',
      '.ep-btc-panel.open{display:block;}',
      '.ep-btc-addr{font-family:monospace;color:' + GOLD + ';margin-top:4px;font-size:12px;}',
      '.ep-interac-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:10001;display:flex;align-items:center;justify-content:center;}',
      '.ep-interac-modal{background:#111;border:1px solid ' + GOLD + ';border-radius:10px;padding:24px;max-width:380px;width:90%;color:' + TEXT + ';font-family:monospace;font-size:13px;line-height:1.6;position:relative;}',
      '.ep-interac-modal h3{font-family:system-ui,sans-serif;color:' + GOLD + ';margin:0 0 14px;font-size:16px;}',
      '.ep-interac-modal pre{white-space:pre-wrap;margin:0;}',
      '.ep-interac-close{position:absolute;top:12px;right:14px;background:none;border:none;color:' + TEXT + ';font-size:20px;cursor:pointer;}',
      '.ep-discount-note{font-size:12px;color:' + EMERALD + ';margin-bottom:12px;}',
    ].join(''));

    /*
     * renderButtons(containerId, service, plan, amount)
     *
     * containerId  — id of the element to render into (string or Element)
     * service      — key in window.EMPIRE_PAYMENTS.services (e.g. 'omniaguard')
     * plan         — plan key (e.g. 'starter')
     * amount       — base price number (pass null for custom/variable)
     */
    function renderButtons(containerId, service, plan, amount) {
      var container = (typeof containerId === 'string')
        ? document.getElementById(containerId)
        : containerId;
      if (!container) {
        console.warn('[payment-ui] Container not found: ' + containerId);
        return;
      }

      var cfg = window.EMPIRE_PAYMENTS;
      if (!cfg) {
        console.warn('[payment-ui] window.EMPIRE_PAYMENTS not loaded. Include stripe-config.js first.');
        container.innerHTML = '<p style="color:#F87171">Payment config not loaded.</p>';
        return;
      }

      var svc = cfg.services[service];
      if (!svc) {
        console.warn('[payment-ui] Unknown service: ' + service);
        return;
      }
      var p = svc.plans[plan];
      if (!p) {
        console.warn('[payment-ui] Unknown plan: ' + plan);
        return;
      }

      // Apply active discount
      var discountPct   = window.EmpireDiscount ? window.EmpireDiscount.getTotal() : 0;
      var displayAmount = (amount !== null && amount !== undefined)
        ? (discountPct > 0
            ? parseFloat((amount * (1 - discountPct / 100)).toFixed(2))
            : amount)
        : null;

      var amountHtml = displayAmount !== null
        ? '<div class="ep-amount">$' + displayAmount + '<small> / ' + (p.recurring || 'one-time') + '</small>'
          + (discountPct > 0 ? '<div class="ep-discount-note">' + discountPct + '% discount applied</div>' : '')
          + '</div>'
        : '<div class="ep-amount">Custom pricing<small> — contact us</small></div>';

      var paymentUrl   = cfg.getPaymentUrl(service, plan);
      var isLoopA      = (svc.loop === 'A');
      var isFree       = (p.price === 0);
      var isCustom     = (p.price === null);

      // Build primary button HTML
      var primaryBtnHtml = '';
      if (isFree) {
        primaryBtnHtml = '<a class="ep-btn ep-btn-paypal" href="#" onclick="return false;" style="background:#10B981;color:#fff;">Get Started Free</a>';
      } else if (isCustom) {
        primaryBtnHtml = '<a class="ep-btn ep-btn-paypal-inquiry" href="' + (paymentUrl || 'mailto:' + svc.contact) + '">Request Custom Quote</a>';
      } else if (isLoopA && paymentUrl) {
        // Loop A — direct PayPal.me
        primaryBtnHtml = '<a class="ep-btn ep-btn-paypal" href="' + paymentUrl + '" target="_blank" rel="noopener">Pay with PayPal</a>';
      } else if (!isLoopA && paymentUrl) {
        // Loop B — invoice/inquiry email
        primaryBtnHtml = '<a class="ep-btn ep-btn-paypal-inquiry" href="' + paymentUrl + '">Request Invoice / Pay via PayPal</a>';
      }

      // Interac button (skip for free plans)
      var interacBtnHtml = '';
      if (!isFree) {
        interacBtnHtml = '<button class="ep-btn ep-btn-interac" id="ep-interac-' + service + '-' + plan + '">Pay via Interac e-Transfer</button>';
      }

      // BTC section
      var btcHtml = [
        '<button class="ep-btc-toggle" id="ep-btc-toggle-' + service + '-' + plan + '">&#9889; Pay with Bitcoin (BTC)</button>',
        '<div class="ep-btc-panel" id="ep-btc-panel-' + service + '-' + plan + '">',
        '  <div>Send BTC to:</div>',
        '  <div class="ep-btc-addr">' + (cfg.BTC || 'Address loading...') + '</div>',
        '  <div style="margin-top:8px;font-size:11px;color:rgba(238,238,238,0.45);">ETH: coming soon</div>',
        '</div>',
      ].join('');

      // Label
      var svcLabel  = service.charAt(0).toUpperCase() + service.slice(1);
      var planLabel = p.label || (plan.charAt(0).toUpperCase() + plan.slice(1));

      container.innerHTML = [
        '<div class="empire-payment-wrap">',
        '  <h4>' + svcLabel + ' &mdash; ' + planLabel + ' Plan</h4>',
        amountHtml,
        primaryBtnHtml,
        interacBtnHtml,
        btcHtml,
        '</div>',
      ].join('');

      // Wire BTC toggle
      var btcToggle = container.querySelector('#ep-btc-toggle-' + service + '-' + plan);
      var btcPanel  = container.querySelector('#ep-btc-panel-' + service + '-' + plan);
      if (btcToggle && btcPanel) {
        btcToggle.addEventListener('click', function () {
          btcPanel.classList.toggle('open');
        });
      }

      // Wire Interac button
      var interacBtn = container.querySelector('#ep-interac-' + service + '-' + plan);
      if (interacBtn) {
        interacBtn.addEventListener('click', function () {
          _showInteracModal(service, plan, displayAmount);
        });
      }
    }

    /* Show Interac modal overlay */
    function _showInteracModal(service, plan, amount) {
      var existing = document.getElementById('ep-interac-modal-bg');
      if (existing) { existing.remove(); }

      var cfg          = window.EMPIRE_PAYMENTS;
      var instructions = cfg ? cfg.getInteracInstructions(service, plan, amount) : 'Instructions unavailable.';

      var bg = document.createElement('div');
      bg.className = 'ep-interac-modal-bg';
      bg.id        = 'ep-interac-modal-bg';
      bg.innerHTML = [
        '<div class="ep-interac-modal">',
        '  <button class="ep-interac-close" id="ep-interac-close">&times;</button>',
        '  <h3>Interac e-Transfer</h3>',
        '  <pre>' + _escapeHtml(instructions) + '</pre>',
        '</div>',
      ].join('');
      document.body.appendChild(bg);

      document.getElementById('ep-interac-close').addEventListener('click', function () { bg.remove(); });
      bg.addEventListener('click', function (e) { if (e.target === bg) { bg.remove(); } });
    }

    function _escapeHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    return { renderButtons: renderButtons };
  })();


  /* ═════════════════════════════════════════════════════════════════════════
   * 5. TIMMY AI BADGE
   * ═════════════════════════════════════════════════════════════════════════ */

  window.TimmyBadge = (function () {

    function inject() {
      if (document.getElementById('timmy-badge')) { return; }

      injectStyle('timmy-badge-style', [
        '#timmy-badge{position:fixed;top:14px;right:16px;z-index:9999;display:flex;align-items:center;gap:7px;background:rgba(0,0,0,0.82);border:1px solid rgba(16,185,129,0.4);border-radius:20px;padding:6px 12px;cursor:pointer;font-family:system-ui,sans-serif;font-size:12px;color:' + TEXT + ';user-select:none;}',
        '#timmy-badge:hover{border-color:' + EMERALD + ';}',
        '.timmy-dot{width:8px;height:8px;border-radius:50%;background:' + EMERALD + ';flex-shrink:0;animation:timmyPulse 2s infinite;}',
        '@keyframes timmyPulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,0.5);}50%{opacity:0.7;box-shadow:0 0 0 5px rgba(16,185,129,0);}}',
        '#timmy-tooltip{position:fixed;top:46px;right:16px;z-index:9999;background:' + BG + ';border:1px solid ' + EMERALD + ';border-radius:8px;padding:10px 14px;font-family:system-ui,sans-serif;font-size:12px;color:' + TEXT + ';max-width:220px;line-height:1.5;display:none;}',
        '#timmy-tooltip.visible{display:block;}',
      ].join(''));

      var badge = document.createElement('div');
      badge.id  = 'timmy-badge';
      badge.innerHTML = '<span class="timmy-dot"></span><span>🤖 Timmy AI Monitoring Active</span>';
      document.body.appendChild(badge);

      var tooltip = document.createElement('div');
      tooltip.id  = 'timmy-tooltip';
      tooltip.textContent = 'AI oversight layer active. Monitoring for anomalies.';
      document.body.appendChild(tooltip);

      badge.addEventListener('click', function () {
        tooltip.classList.toggle('visible');
      });

      // Close tooltip when clicking elsewhere
      document.addEventListener('click', function (e) {
        if (!badge.contains(e.target) && !tooltip.contains(e.target)) {
          tooltip.classList.remove('visible');
        }
      });
    }

    return { inject: inject };
  })();


  /* ═════════════════════════════════════════════════════════════════════════
   * AUTO-INIT on DOMContentLoaded
   * ═════════════════════════════════════════════════════════════════════════ */

  function _autoInit() {
    // 1. Apply ?ref= from URL
    var urlParams = new URLSearchParams(window.location.search);
    var refCode   = urlParams.get('ref');
    if (refCode && window.EmpireReferral) {
      window.EmpireReferral.apply(refCode);
    }

    // 2. Stripe-unavailable banner
    if (window.STRIPE_UNAVAILABLE === true) {
      var dismissed = sessionStorage.getItem('empire_stripe_banner_dismissed');
      if (!dismissed) {
        injectStripeBanner();
      }
    }

    // 3. Timmy AI badge
    if (window.TIMMY_ACTIVE === true && window.TimmyBadge) {
      window.TimmyBadge.inject();
    }

    // 4. Discount panel (always inject so users can self-identify)
    if (window.EmpireDiscount) {
      window.EmpireDiscount.inject();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _autoInit);
  } else {
    // DOM already ready (script loaded after parse)
    _autoInit();
  }

})();
