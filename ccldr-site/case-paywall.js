/* Weedlaw Case Access — client-side v1 paywall (no backend).
   Derek issues an access code per paid subscriber after PayPal payment clears.
   Codes below are the v1 shared per-tier codes — change ACCESS_CODES to rotate them. */
(function () {
  var ACCESS_CODES = {
    'WEEDLAW49': 'basic',
    'WEEDLAW99': 'pro',
    'WEEDLAW299': 'enterprise'
  };
  var TIER_RANK = { basic: 1, pro: 2, enterprise: 3 };
  var TIER_LABEL = { basic: 'Basic Follower', pro: 'Pro Litigant', enterprise: 'Enterprise Firm' };
  var STORAGE_KEY = 'ccldr_case_access_v1';

  function getUnlock() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch (e) { return null; }
  }
  function setUnlock(tier) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tier: tier, unlockedAt: Date.now() }));
  }
  function hasTier(minTier) {
    var u = getUnlock();
    if (!u || !TIER_RANK[u.tier]) return false;
    return TIER_RANK[u.tier] >= (TIER_RANK[minTier] || 1);
  }
  function tryUnlock(code) {
    var key = (code || '').trim().toUpperCase();
    if (ACCESS_CODES[key]) {
      setUnlock(ACCESS_CODES[key]);
      return ACCESS_CODES[key];
    }
    return null;
  }

  function applyGates() {
    document.querySelectorAll('[data-paywall]').forEach(function (el) {
      var min = el.getAttribute('data-paywall') || 'basic';
      el.classList.toggle('pw-locked', !hasTier(min));
    });
    document.querySelectorAll('.pw-status-banner').forEach(function (el) {
      var u = getUnlock();
      el.textContent = u ? ('✓ Unlocked — ' + (TIER_LABEL[u.tier] || u.tier) + ' access active') : '';
      el.style.display = u ? 'block' : 'none';
    });
    document.querySelectorAll('.pw-logout').forEach(function (el) {
      el.style.display = getUnlock() ? 'inline-block' : 'none';
    });
  }

  window.submitAccessCode = function (formEl) {
    var input = formEl.querySelector('input[name="access-code"]');
    var msg = formEl.querySelector('.pw-msg');
    var tier = tryUnlock(input ? input.value : '');
    if (tier) {
      if (msg) { msg.textContent = '✓ Unlocked — ' + TIER_LABEL[tier] + ' access active. Reloading…'; msg.style.color = '#00C864'; }
      setTimeout(function () { location.reload(); }, 700);
    } else {
      if (msg) { msg.textContent = '✗ Invalid access code. Codes are issued by Derek after payment clears.'; msg.style.color = '#FF5555'; }
    }
    return false;
  };

  window.pwLogout = function () {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };

  // PRICING DISCOUNT CALCULATOR (veteran/fixed-income/terminal-illness + referral)
  window.pwRecalcPricing = function () {
    var form = document.getElementById('pw-pricing-calc');
    if (!form) return;
    var category = form.querySelector('input[name="pw-category"]:checked');
    var categoryDiscount = category ? parseFloat(category.value) : 0;
    var referralInput = form.querySelector('input[name="pw-referral"]');
    var referralActive = referralInput && referralInput.value.trim().length >= 3;
    var referralDiscount = referralActive ? 20 : 0;
    var total = Math.min(categoryDiscount + referralDiscount, 65);

    document.querySelectorAll('.pw-tier-card[data-base-price]').forEach(function (card) {
      var base = parseFloat(card.getAttribute('data-base-price'));
      var final = total > 0 ? +(base * (1 - total / 100)).toFixed(2) : base;
      var priceEl = card.querySelector('.pw-price-amount');
      var origEl = card.querySelector('.pw-price-original');
      var tagEl = card.querySelector('.pw-discount-tag');
      var payBtn = card.querySelector('.pw-pay-btn');
      if (priceEl) priceEl.textContent = '$' + final;
      if (origEl) origEl.style.display = total > 0 ? 'inline' : 'none';
      if (origEl) origEl.textContent = total > 0 ? ('$' + base) : '';
      if (tagEl) tagEl.style.display = total > 0 ? 'inline' : 'none';
      if (tagEl) tagEl.textContent = total > 0 ? ('-' + total + '% applied') : '';
      if (payBtn) payBtn.href = 'https://paypal.me/techpetcage/' + final;
    });
  };

  // COMMENTS (local-only v1 — per case, stored in this browser)
  window.pwPostComment = function (caseId, formEl) {
    var input = formEl.querySelector('textarea[name="comment"]');
    var text = input ? input.value.trim() : '';
    if (!text) return false;
    var key = 'ccldr_comments_' + caseId;
    var list;
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { list = []; }
    list.unshift({ text: text, ts: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
    input.value = '';
    window.pwRenderComments(caseId);
    return false;
  };
  window.pwRenderComments = function (caseId) {
    var wrap = document.getElementById('pw-comments-' + caseId);
    if (!wrap) return;
    var key = 'ccldr_comments_' + caseId;
    var list;
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { list = []; }
    if (!list.length) {
      wrap.innerHTML = '<p style="color:var(--muted);font-size:0.85rem;">No comments yet — be the first subscriber to weigh in.</p>';
      return;
    }
    wrap.innerHTML = list.map(function (c) {
      var d = new Date(c.ts);
      return '<div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);"><div style="font-size:0.72rem;color:var(--muted);margin-bottom:4px;">' + d.toLocaleDateString() + '</div><div style="font-size:0.88rem;">' + c.text.replace(/</g, '&lt;') + '</div></div>';
    }).join('');
  };

  window.CasePaywall = { getUnlock: getUnlock, hasTier: hasTier, applyGates: applyGates };
  document.addEventListener('DOMContentLoaded', applyGates);
})();
