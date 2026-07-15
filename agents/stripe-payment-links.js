// stripe-payment-links.js — Empire Stripe Payment Links
// Create links at: dashboard.stripe.com/payment-links
// Paste the https://buy.stripe.com/XXXX URLs below
// Then Claude will wire them into every Buy button across all sites
//
// Stripe LIVE account (RECOVERED — June 2026)
// Currency: CAD on all one-time, CAD subscriptions for recurring

window.STRIPE_PAYMENT_LINKS = {

  // ── OMNIAGUARD (Loop B — omniaguard1@gmail.com) ─────────────────────────
  // Create these at dashboard.stripe.com/payment-links → New
  'omniguard-audit-500':    'REPLACE_WITH_STRIPE_LINK',  // One-time $500 CAD
  'omniguard-vpn-99':       'REPLACE_WITH_STRIPE_LINK',  // Recurring $99/mo CAD
  'omniguard-bundle-149':   'REPLACE_WITH_STRIPE_LINK',  // One-time $149 CAD

  // ── CCLDR (Loop A — franciscoderek7@gmail.com) ───────────────────────────
  'ccldr-foundation-149':   'REPLACE_WITH_STRIPE_LINK',  // One-time $149 CAD
  'ccldr-practitioner-499': 'REPLACE_WITH_STRIPE_LINK',  // One-time $499 CAD
  'ccldr-elite-1499':       'REPLACE_WITH_STRIPE_LINK',  // One-time $1,499 CAD
  'ccldr-digital-99':       'REPLACE_WITH_STRIPE_LINK',  // One-time $99 CAD
  'ccldr-course-299':       'REPLACE_WITH_STRIPE_LINK',  // One-time $299 CAD
  'ccldr-sovereignty-999':  'REPLACE_WITH_STRIPE_LINK',  // One-time $999 CAD

  // ── TechPetCage (Loop A) ─────────────────────────────────────────────────
  'techpet-basic-19':       'REPLACE_WITH_STRIPE_LINK',  // Recurring $19/mo CAD
  'techpet-pro-49':         'REPLACE_WITH_STRIPE_LINK',  // Recurring $49/mo CAD
  'techpet-kennel-149':     'REPLACE_WITH_STRIPE_LINK',  // Recurring $149/mo CAD

  // ── Francisco Holdings (Loop A) ──────────────────────────────────────────
  'fh-strategy-500':        'REPLACE_WITH_STRIPE_LINK',  // One-time $500 CAD
  'fh-boardroom-1000':      'REPLACE_WITH_STRIPE_LINK',  // One-time $1,000 CAD

  // ── Kiaros (Loop B) ──────────────────────────────────────────────────────
  'kiaros-pro-79':          'REPLACE_WITH_STRIPE_LINK',  // Recurring $79/mo CAD
  'kiaros-enterprise-249':  'REPLACE_WITH_STRIPE_LINK',  // Recurring $249/mo CAD
  'kiaros-sovereign-999':   'REPLACE_WITH_STRIPE_LINK',  // Recurring $999/mo CAD

  // ── Vault Velocity Auto (Loop A) ─────────────────────────────────────────
  'vaultvelocity-scout-99':     'REPLACE_WITH_STRIPE_LINK',  // Recurring $99/mo
  'vaultvelocity-fleet-499':    'REPLACE_WITH_STRIPE_LINK',  // Recurring $499/mo
  'vaultvelocity-enterprise-2500': 'REPLACE_WITH_STRIPE_LINK', // Recurring $2,500/mo

  // ── Vigilax (Loop B) ─────────────────────────────────────────────────────
  'vigilax-sentinel-499':   'REPLACE_WITH_STRIPE_LINK',  // Recurring $499/mo
  'vigilax-guardian-2499':  'REPLACE_WITH_STRIPE_LINK',  // Recurring $2,499/mo
  'vigilax-warden-5000':    'REPLACE_WITH_STRIPE_LINK',  // Recurring $5,000/mo

  // ── zprimedoxaihq (Loop A) ───────────────────────────────────────────────
  'zprimedox-individual-199': 'REPLACE_WITH_STRIPE_LINK', // Recurring $199/mo
  'zprimedox-team-499':       'REPLACE_WITH_STRIPE_LINK', // Recurring $499/mo
  'zprimedox-enterprise-999': 'REPLACE_WITH_STRIPE_LINK', // Recurring $999/mo

};

// Auto-wire Buy buttons: if a data-stripe-link attribute is set on a button,
// this script updates the href to the matching Stripe Payment Link.
(function() {
  function wireStripeLinks() {
    document.querySelectorAll('[data-stripe-product]').forEach(function(el) {
      var productId = el.getAttribute('data-stripe-product');
      var link = window.STRIPE_PAYMENT_LINKS[productId];
      if (link && link !== 'REPLACE_WITH_STRIPE_LINK') {
        el.href = link;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      } else {
        // Fallback: hide Stripe button if link not configured
        el.style.display = 'none';
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireStripeLinks);
  } else {
    wireStripeLinks();
  }
})();
