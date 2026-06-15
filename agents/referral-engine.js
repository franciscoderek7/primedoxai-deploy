// referral-engine.js — PrimeDox Empire Referral Engine v1.0
// CDN: https://cdn.jsdelivr.net/gh/franciscoderek7/primedoxai-deploy@main/agents/referral-engine.js
//
// Discount tiers (by code prefix):
//   SENIOR* → 10% | VET*  → 15% | CARE* → 20% | FIXED* → 10% | general → 10%
//
// Commission rates:
//   First sale → 25% | Recurring → 15%
//
// localStorage key: pd_referral

(function () {
  'use strict';

  var LS_KEY = 'pd_referral';

  // ─── Discount Tier Map ────────────────────────────────────────────────────
  var TIERS = [
    { prefix: 'SENIOR', percent: 10, label: 'Senior Discount' },
    { prefix: 'VET',    percent: 15, label: 'Veteran Discount' },
    { prefix: 'CARE',   percent: 20, label: 'Terminal Illness Care Discount' },
    { prefix: 'FIXED',  percent: 10, label: 'Fixed Income Discount' },
  ];

  var GENERAL_PERCENT = 10;

  // Commission rates (stored in localStorage; Supabase if available)
  var COMMISSION_FIRST     = 0.25;
  var COMMISSION_RECURRING = 0.15;

  // ─── Internal Helpers ─────────────────────────────────────────────────────

  function _normalizeCode(code) {
    return (code || '').toString().trim().toUpperCase();
  }

  function _getTier(code) {
    var c = _normalizeCode(code);
    if (!c) return null;
    for (var i = 0; i < TIERS.length; i++) {
      if (c.indexOf(TIERS[i].prefix) === 0) {
        return { prefix: TIERS[i].prefix, percent: TIERS[i].percent, label: TIERS[i].label };
      }
    }
    // Valid general referral code — must be at least 4 chars and alphanumeric
    if (/^[A-Z0-9]{4,}$/.test(c)) {
      return { prefix: null, percent: GENERAL_PERCENT, label: 'Referral Discount' };
    }
    return null;
  }

  function _loadStored() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function _saveStored(data) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function _getQueryParam(name) {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get(name) || null;
    } catch (e) {
      // IE fallback
      var match = window.location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    }
  }

  // ─── Supabase Logging (graceful no-op) ───────────────────────────────────

  function _supabaseInsert(table, record) {
    try {
      if (window.supabase && typeof window.supabase.from === 'function') {
        window.supabase.from(table).insert([record]).then(function () {}).catch(function () {});
      }
    } catch (e) {}
  }

  // ─── Banner ───────────────────────────────────────────────────────────────

  function _showBanner(code, percent) {
    var existing = document.getElementById('pd-referral-banner');
    if (existing) existing.remove();

    var banner = document.createElement('div');
    banner.id = 'pd-referral-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'right:0',
      'z-index:1000000',
      'background:linear-gradient(90deg,#1a4a1a,#0d2e0d)',
      'border-bottom:2px solid #27ae60',
      'color:#6ee7a0',
      'font-family:system-ui,-apple-system,sans-serif',
      'font-size:14px',
      'font-weight:600',
      'text-align:center',
      'padding:10px 40px 10px 16px',
      'line-height:1.4',
      'box-shadow:0 2px 12px rgba(0,0,0,0.5)',
    ].join(';');

    var close = document.createElement('button');
    close.setAttribute('aria-label', 'Dismiss referral banner');
    close.style.cssText = [
      'position:absolute',
      'right:12px',
      'top:50%',
      'transform:translateY(-50%)',
      'background:transparent',
      'border:none',
      'color:#6ee7a0',
      'font-size:18px',
      'cursor:pointer',
      'line-height:1',
      'padding:4px',
    ].join(';');
    close.textContent = '×';
    close.onclick = function () { banner.remove(); };

    banner.textContent = 'Referral code ' + code + ' applied — ' + percent + '% discount unlocked!';
    banner.appendChild(close);
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // ─── Referral Input UI ────────────────────────────────────────────────────
  // Appended inside any element that has data-referral-target attribute,
  // or injected after any element with data-paypal-product.

  function _buildInputWidget(container) {
    if (!container) return;
    if (container.querySelector('.pd-ref-widget')) return; // already inserted

    var wrap = document.createElement('div');
    wrap.className = 'pd-ref-widget';
    wrap.style.cssText = [
      'margin-top:12px',
      'font-family:system-ui,-apple-system,sans-serif',
    ].join(';');

    var label = document.createElement('label');
    label.style.cssText = 'display:block;font-size:12px;color:#888;margin-bottom:5px;';
    label.textContent = 'Have a referral code?';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;align-items:center;';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter code';
    input.style.cssText = [
      'flex:1',
      'background:#1a1a1a',
      'border:1px solid #333',
      'border-radius:6px',
      'color:#fff',
      'font-size:13px',
      'padding:7px 10px',
      'font-family:inherit',
      'outline:none',
      'text-transform:uppercase',
    ].join(';');

    // Pre-fill if stored
    var stored = _loadStored();
    if (stored && stored.code) input.value = stored.code;

    var applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.textContent = 'Apply';
    applyBtn.style.cssText = [
      'background:#27ae60',
      'color:#fff',
      'border:none',
      'border-radius:6px',
      'padding:7px 14px',
      'font-size:13px',
      'font-weight:600',
      'cursor:pointer',
      'font-family:inherit',
      'white-space:nowrap',
    ].join(';');

    var msg = document.createElement('div');
    msg.style.cssText = 'font-size:12px;margin-top:5px;min-height:16px;';

    function tryApply() {
      var code = input.value.trim().toUpperCase();
      if (!code) { msg.textContent = ''; msg.style.color = ''; return; }
      var tier = _getTier(code);
      if (tier) {
        _captureCode(code, tier);
        msg.textContent = '✓ ' + tier.label + ' (' + tier.percent + '% off) applied!';
        msg.style.color = '#6ee7a0';
      } else {
        msg.textContent = '✗ Code not recognized.';
        msg.style.color = '#e05c5c';
      }
    }

    applyBtn.addEventListener('click', tryApply);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryApply(); });

    row.appendChild(input);
    row.appendChild(applyBtn);
    wrap.appendChild(label);
    wrap.appendChild(row);
    wrap.appendChild(msg);
    container.appendChild(wrap);
  }

  // ─── Code Capture & Persistence ──────────────────────────────────────────

  function _captureCode(code, tier) {
    var data = _loadStored() || { code: null, discount: 0, source: null, ts: null, commissions: [] };
    data.code     = code;
    data.discount = tier.percent;
    data.source   = tier.label;
    data.ts       = Date.now();
    _saveStored(data);

    // Log to Supabase if available
    _supabaseInsert('referrals', {
      code:     code,
      discount: tier.percent,
      source:   tier.label,
      url:      window.location.href,
      ts:       new Date().toISOString(),
    });
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  var ReferralEngine = {

    /**
     * Returns { code, percent, label } for the active referral, or null.
     */
    getDiscount: function () {
      var data = _loadStored();
      if (!data || !data.code) return null;
      return { code: data.code, percent: data.discount, label: data.source };
    },

    /**
     * Returns the discounted amount (number). If no active code, returns amount unchanged.
     */
    applyToAmount: function (amount) {
      var num = parseFloat(amount);
      if (isNaN(num)) return amount;
      var disc = this.getDiscount();
      if (!disc || !disc.percent) return num;
      return Math.round((num - (num * disc.percent / 100)) * 100) / 100;
    },

    /**
     * Logs a completed sale commission to localStorage and Supabase.
     * @param {string} productId
     * @param {number} amount  — original pre-discount amount
     * @param {string|null} referrerId — referrer user ID (optional)
     */
    trackSale: function (productId, amount, referrerId) {
      try {
        var data = _loadStored() || { code: null, discount: 0, source: null, ts: null, commissions: [] };
        if (!data.commissions) data.commissions = [];

        var commissions = data.commissions;
        var isFirst     = !commissions.some(function (c) { return c.productId === productId; });
        var rate        = isFirst ? COMMISSION_FIRST : COMMISSION_RECURRING;
        var commission  = Math.round(parseFloat(amount) * rate * 100) / 100;

        var entry = {
          productId:   productId,
          amount:      parseFloat(amount),
          commission:  commission,
          rate:        (rate * 100) + '%',
          type:        isFirst ? 'first' : 'recurring',
          referrerId:  referrerId || null,
          code:        data.code || null,
          ts:          Date.now(),
        };

        data.commissions = commissions.concat([entry]).slice(-200);
        _saveStored(data);

        _supabaseInsert('referral_commissions', {
          product_id:  productId,
          amount:      parseFloat(amount),
          commission:  commission,
          rate:        entry.rate,
          type:        entry.type,
          referrer_id: referrerId || null,
          ref_code:    data.code || null,
          ts:          new Date().toISOString(),
        });
      } catch (e) {}
    },

    /**
     * Returns a shareable URL with ?ref=CODE appended to the current page.
     */
    getShareLink: function (referralCode) {
      var base = window.location.origin + window.location.pathname;
      var sep  = window.location.search ? '&' : '?';
      var existing = window.location.search;
      // Remove any existing ref param
      var clean = existing.replace(/[?&]ref=[^&]*/g, '').replace(/^\?&/, '?').replace(/^&/, '');
      sep = clean ? '&' : '?';
      return base + (clean || '') + sep + 'ref=' + encodeURIComponent(_normalizeCode(referralCode));
    },

    /**
     * Auto-initialises: captures ?ref=CODE from URL, shows banner, injects widgets.
     * Called automatically on DOMContentLoaded.
     */
    init: function () {
      // 1. Capture ?ref= param from URL
      var paramCode = _getQueryParam('ref');
      if (paramCode) {
        var normalised = _normalizeCode(paramCode);
        var tier = _getTier(normalised);
        if (tier) {
          _captureCode(normalised, tier);
          _showBanner(normalised, tier.percent);
        } else {
          // Unknown code — still store raw, no discount
          var data = _loadStored() || { code: null, discount: 0, source: null, ts: null, commissions: [] };
          data.code = normalised; data.discount = 0; data.source = 'Unknown'; data.ts = Date.now();
          _saveStored(data);
          _showBanner(normalised, 0);
        }
      } else {
        // Check if a previously stored referral exists and show banner
        var existing = _loadStored();
        if (existing && existing.code && existing.discount > 0) {
          _showBanner(existing.code, existing.discount);
        }
      }

      // 2. Inject referral input widget after every [data-paypal-product] button
      //    that is NOT already inside a dedicated checkout modal
      document.querySelectorAll('[data-paypal-product]').forEach(function (btn) {
        var parent = btn.parentElement;
        if (parent && !parent.querySelector('.pd-ref-widget')) {
          _buildInputWidget(parent);
        }
      });

      // 3. Wire any explicit [data-referral-target] containers
      document.querySelectorAll('[data-referral-target]').forEach(function (container) {
        _buildInputWidget(container);
      });
    },
  };

  window.ReferralEngine = ReferralEngine;

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.ReferralEngine.init(); });
  } else {
    window.ReferralEngine.init();
  }

})();
