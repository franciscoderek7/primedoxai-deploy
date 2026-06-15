// payment-provider.js — PrimeDox Payment Infrastructure v1.0
// Controls all checkout buttons across the empire
//
// TO SWITCH PROVIDERS:
//   Set window.PAYMENT_PROVIDER = 'paypal' (default) or 'stripe' (when unlocked)
//   Or set <script>window.PAYMENT_PROVIDER = 'stripe';</script> before this file
//
// Stripe account: acct_1TG0cIASsTLqnu8V — LIVE (recovered June 2026)
// pk_live key active. Set window.PAYMENT_PROVIDER = 'stripe' to enable Stripe checkout.

(function () {
  'use strict';

  var PROVIDER = window.PAYMENT_PROVIDER || 'paypal';

  // ─── PayPal Links ─────────────────────────────────────────────────────────
  // PAYPAL SWAP ZONE: Replace paypal.me URLs with PayPal Business payment links
  // from paypal.com/buttons once Derek creates them.
  // Loop A (franciscoderek7@gmail.com): CCLDR, BENO-X, PrimeDox, FH, TechPet
  // Loop B (omniaguard1@gmail.com): OmniaGuard, Vigilax — marked with LOOP-B
  var PAYPAL_LINKS = {
    // ── OmniaGuard (Loop B — omniaguard1@gmail.com) ─────────────────────────
    'omniguard-vpn-99':          'https://paypal.me/franciscoderek7/99',   // SWAP → omniaguard1 link
    'omniguard-vault-99':        'https://paypal.me/franciscoderek7/99',   // SWAP → omniaguard1 link
    'omniguard-bundle-149':      'https://paypal.me/franciscoderek7/149',  // SWAP → omniaguard1 link
    'omniguard-audit-500':       'https://paypal.me/franciscoderek7/500',  // SWAP → omniaguard1 link
    'omniguard-session-500':     'https://paypal.me/franciscoderek7/500',  // SWAP → omniaguard1 link
    // ── BENO-X ───────────────────────────────────────────────────────────────
    'benox-session-500':         'https://paypal.me/franciscoderek7/500',
    // ── CCLDR ────────────────────────────────────────────────────────────────
    'ccldr-digital-99':          'https://paypal.me/franciscoderek7/99',
    'ccldr-course-299':          'https://paypal.me/franciscoderek7/299',
    'ccldr-foundation-149':      'https://paypal.me/franciscoderek7/149',
    'ccldr-practitioner-499':    'https://paypal.me/franciscoderek7/499',
    'ccldr-sovereignty-999':     'https://paypal.me/franciscoderek7/999',
    'ccldr-elite-1499':          'https://paypal.me/franciscoderek7/1499',
    'ccldr-templates-49':        'https://paypal.me/franciscoderek7/49',
    'ccldr-inmate-29':           'https://paypal.me/franciscoderek7/29',
    'ccldr-session-500':         'https://paypal.me/franciscoderek7/500',
    'ccldr-session-750':         'https://paypal.me/franciscoderek7/750',
    'ccldr-session-1000':        'https://paypal.me/franciscoderek7/1000',
    'ccldr-donate':              'https://paypal.me/franciscoderek7/',     // open amount
    // ── TechPetCage ──────────────────────────────────────────────────────────
    'techpet-basic-19':          'https://paypal.me/franciscoderek7/19',
    'techpet-pro-49':            'https://paypal.me/franciscoderek7/49',
    'techpet-kennel-149':        'https://paypal.me/franciscoderek7/149',
    // ── PrimeDox AI ──────────────────────────────────────────────────────────
    'primedox-doc-49':           'https://paypal.me/franciscoderek7/49',
    'primedox-pro-99':           'https://paypal.me/franciscoderek7/99',
    'primedox-enterprise-499':   'https://paypal.me/franciscoderek7/499',
    // ── Francisco Holdings ────────────────────────────────────────────────────
    'fh-strategy-500':           'https://paypal.me/franciscoderek7/500',
    'fh-boardroom-1000':         'https://paypal.me/franciscoderek7/1000',
    'fh-enterprise':             'mailto:franciscoderek7@gmail.com?subject=FH%20Enterprise%20Inquiry',
    // ── Vigilax (Loop B) ─────────────────────────────────────────────────────
    'vigilax-custom-5000':       'https://paypal.me/franciscoderek7/5000', // SWAP → Loop B link
    'vigilax-retainer-10000':    'https://paypal.me/franciscoderek7/10000',// SWAP → Loop B link
  };

  // ─── Stripe Price IDs ─────────────────────────────────────────────────────
  // Populate these when Stripe is re-enabled (acct_1TG0cIASsTLqnu8V)
  // See: agents/backend/stripe-config.js for full Stripe setup
  var STRIPE_PRICE_IDS = {
    // 'ccldr-digital-99':       'price_xxxxxxxxxxxxx',
    // 'ccldr-foundation-149':   'price_xxxxxxxxxxxxx',
    // 'omniguard-vpn-99':       'price_xxxxxxxxxxxxx',
    // Add all products once Stripe is unlocked
  };

  // ─── Public API ───────────────────────────────────────────────────────────
  window.PrimeDoxPayment = {

    checkout: function (productId, amount, label) {
      // Apply referral discount if ReferralEngine is loaded
      var finalAmount = amount;
      if (window.ReferralEngine && typeof window.ReferralEngine.applyToAmount === 'function') {
        var discounted = window.ReferralEngine.applyToAmount(parseFloat(amount) || 0);
        if (discounted !== (parseFloat(amount) || 0)) {
          finalAmount = discounted;
        }
      }

      if (PROVIDER === 'stripe') {
        this._stripeCheckout(productId, finalAmount, label);
      } else {
        this._paypalCheckout(productId, finalAmount, label);
      }

      // Track sale commission after initiating checkout
      if (window.ReferralEngine && typeof window.ReferralEngine.trackSale === 'function') {
        window.ReferralEngine.trackSale(productId, parseFloat(amount) || 0, null);
      }
    },

    _paypalCheckout: function (productId, amount, label) {
      var link = PAYPAL_LINKS[productId];

      // Dynamic fallback: build paypal.me URL from amount
      if (!link && amount && parseFloat(amount) > 0) {
        link = 'https://paypal.me/franciscoderek7/' + parseFloat(amount).toFixed(0);
      }

      // Last resort: email
      if (!link || link === 'https://paypal.me/franciscoderek7/') {
        if (productId === 'ccldr-donate' || !amount) {
          link = 'https://paypal.me/franciscoderek7/';
        } else {
          var subject = encodeURIComponent('PrimeDox Payment — ' + (label || productId));
          link = 'mailto:franciscoderek7@gmail.com?subject=' + subject;
        }
      }

      this._track(productId, amount);
      window.open(link, '_blank', 'noopener,noreferrer');
      this._showToast(amount, label);
    },

    _stripeCheckout: function (productId, amount, label) {
      var priceId = STRIPE_PRICE_IDS[productId];
      if (!priceId) {
        console.warn('[PrimeDoxPayment] Stripe price ID not found for:', productId, '— falling back to PayPal');
        this._paypalCheckout(productId, amount, label);
        return;
      }
      var self = this;
      try {
        var stripe = Stripe(window.STRIPE_PK || '');
        stripe.redirectToCheckout({
          lineItems: [{ price: priceId, quantity: 1 }],
          mode: amount && parseFloat(amount) >= 100 ? 'subscription' : 'payment',
          successUrl: window.location.origin + window.location.pathname + '?payment=success',
          cancelUrl:  window.location.href,
        }).then(function (result) {
          if (result.error) {
            console.error('[PrimeDoxPayment] Stripe error:', result.error);
            self._paypalCheckout(productId, amount, label);
          }
        });
      } catch (e) {
        console.error('[PrimeDoxPayment] Stripe failed, falling back to PayPal:', e);
        this._paypalCheckout(productId, amount, label);
      }
    },

    _track: function (productId, amount) {
      try {
        var key = 'pd_conversions';
        var list = JSON.parse(localStorage.getItem(key) || '[]');
        list.push({ product: productId, amount: amount, ts: Date.now(), provider: PROVIDER });
        localStorage.setItem(key, JSON.stringify(list.slice(-100)));
      } catch (e) {}
    },

    _showToast: function (amount, label) {
      var existing = document.getElementById('pd-payment-toast');
      if (existing) existing.remove();

      var toast = document.createElement('div');
      toast.id = 'pd-payment-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.style.cssText = [
        'position:fixed',
        'bottom:24px',
        'left:50%',
        'transform:translateX(-50%)',
        'background:#0d1f0d',
        'border:1px solid #27ae60',
        'border-radius:12px',
        'padding:16px 24px',
        'color:#6ee7a0',
        'font-size:14px',
        'font-weight:600',
        'z-index:999999',
        'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
        'text-align:center',
        'max-width:calc(100vw - 32px)',
        'width:max-content',
        'font-family:system-ui,-apple-system,sans-serif',
      ].join(';');

      var amtText = amount ? ' $' + parseFloat(amount).toFixed(0) : '';
      toast.innerHTML =
        '✅ PayPal opened — complete your' + amtText + ' payment.<br>' +
        '<span style="font-size:12px;color:#4ade80;font-weight:400;">' +
        'Questions? <a href="mailto:franciscoderek7@gmail.com" style="color:#c9a227;">franciscoderek7@gmail.com</a>' +
        '</span>';

      document.body.appendChild(toast);
      setTimeout(function () {
        toast.style.transition = 'opacity .5s';
        toast.style.opacity = '0';
        setTimeout(function () { toast.remove(); }, 500);
      }, 6000);
    },

    // Wire all data-paypal-product buttons in the DOM
    init: function () {
      var self = this;
      document.querySelectorAll('[data-paypal-product]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var productId = btn.getAttribute('data-paypal-product');
          var amount    = btn.getAttribute('data-paypal-amount') || '';
          var label     = btn.textContent.trim();
          self.checkout(productId, amount, label);
        });
      });

      // Show success message if returning from Stripe
      if (window.location.search.includes('payment=success')) {
        this._showToast('', 'Payment confirmed');
      }
    },
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.PrimeDoxPayment.init(); });
  } else {
    window.PrimeDoxPayment.init();
  }

})();
