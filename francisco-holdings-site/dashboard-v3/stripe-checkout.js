/* Stripe Checkout v3 — Empire Subscription Handler */
/* Derek: replace pk_live_ key and price_ IDs after Stripe setup */
(function (w) {
  'use strict';

  var CFG = {
    pk: w.STRIPE_PK || 'pk_live_REPLACE_WITH_YOUR_PUBLISHABLE_KEY',
    successUrl: 'https://franciscoholdingsinc.com/thank-you.html',
    cancelUrl:  'https://franciscoholdingsinc.com/dashboard-v3/',
  };

  var PLANS = [
    {
      id: 'omnia-shield',
      name: 'OMNIAGUARD Shield',
      price: '$49/mo',
      priceId: 'price_REPLACE_OMNIAGUARD_SHIELD',
      desc: 'Personal AI threat monitoring · real-time alerts · 1 device',
      tag: 'SECURITY',
    },
    {
      id: 'omnia-home',
      name: 'OMNIAGUARD Home',
      price: '$99/mo',
      priceId: 'price_REPLACE_OMNIAGUARD_HOME',
      desc: 'Home network shield · full device coverage · weekly reports',
      tag: 'SECURITY',
    },
    {
      id: 'omnia-ent',
      name: 'OMNIAGUARD Enterprise',
      price: '$497/mo',
      priceId: 'price_REPLACE_OMNIAGUARD_ENTERPRISE',
      desc: 'Unlimited endpoints · 24/7 SOC · executive reporting',
      tag: 'SECURITY',
      featured: true,
    },
    {
      id: 'primedox-starter',
      name: 'PrimeDox AI Starter',
      price: '$149/mo',
      priceId: 'price_REPLACE_PRIMEDOX_STARTER',
      desc: 'AI document automation · 3 active matters · e-signature',
      tag: 'LEGAL AI',
    },
    {
      id: 'primedox-pro',
      name: 'PrimeDox AI Pro',
      price: '$499/mo',
      priceId: 'price_REPLACE_PRIMEDOX_PRO',
      desc: 'Unlimited documents · client portal · AI intake · booking',
      tag: 'LEGAL AI',
      featured: true,
    },
    {
      id: 'ccldr-pro',
      name: 'CCLDR Professional',
      price: '$499/mo',
      priceId: 'price_REPLACE_CCLDR_PRO',
      desc: 'Cannabis compliance tracking · Health Canada reporting · AI alerts',
      tag: 'CANNABIS',
      featured: true,
    },
  ];

  var stripe = null;

  function loadStripe(cb) {
    if (w.Stripe) { stripe = w.Stripe(CFG.pk); cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload = function () { stripe = w.Stripe(CFG.pk); cb(); };
    document.head.appendChild(s);
  }

  function subscribe(priceId, planName, btn) {
    if (!stripe) { alert('Stripe loading — try again.'); return; }
    if (priceId.startsWith('price_REPLACE_')) {
      alert('Stripe not configured yet. Contact derek@franciscoholdingsinc.com or use PayPal: paypal.me/derekfranciaco1');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'REDIRECTING…';
    stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: CFG.successUrl + '?plan=' + encodeURIComponent(planName),
      cancelUrl:  CFG.cancelUrl,
    }).then(function (r) {
      if (r.error) {
        alert('Payment error: ' + r.error.message);
        btn.disabled = false;
        btn.textContent = 'SUBSCRIBE';
      }
    });
  }

  function renderPlans(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;">' +
      PLANS.map(function (p) {
        var featStyle = p.featured
          ? 'border:1px solid var(--gold);position:relative;'
          : 'border:1px solid var(--border);';
        var featBadge = p.featured
          ? '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);' +
            'background:var(--gold);color:#000;font-size:9px;font-weight:700;letter-spacing:2px;' +
            'text-transform:uppercase;padding:2px 10px;border-radius:2px;">POPULAR</div>'
          : '';
        return '<div style="background:var(--card);border-radius:4px;padding:22px;' + featStyle + '">' +
          featBadge +
          '<div style="font-size:9px;letter-spacing:2px;color:var(--cyan);margin-bottom:6px;">' + p.tag + '</div>' +
          '<div style="font-family:var(--font-hud);font-size:12px;letter-spacing:2px;color:var(--gold);margin-bottom:8px;">' + p.name + '</div>' +
          '<div style="font-family:var(--font-hud);font-size:22px;color:var(--text);margin-bottom:10px;">' + p.price + '</div>' +
          '<div style="font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:18px;">' + p.desc + '</div>' +
          '<button id="stripe-btn-' + p.id + '" onclick="window.StripeCheckout.subscribe(\'' + p.priceId + '\',\'' + p.name + '\',this)" style="' +
            'width:100%;background:linear-gradient(135deg,rgba(201,184,150,0.12),rgba(201,184,150,0.22));' +
            'border:1px solid var(--gold);color:var(--gold);padding:12px;font-family:var(--font-hud);' +
            'font-size:10px;letter-spacing:3px;cursor:pointer;border-radius:2px;transition:opacity 0.2s;' +
            'text-transform:uppercase;">SUBSCRIBE</button>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  function init(containerId) {
    loadStripe(function () {
      if (containerId) renderPlans(containerId);
    });
  }

  w.StripeCheckout = { init: init, subscribe: subscribe, PLANS: PLANS };
})(window);
