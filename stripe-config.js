/* stripe-config.js — Francisco Holdings Empire Payment Config
 * STRIPE SWAP ZONE: When real Stripe Payment Links exist:
 *   1. Set STRIPE_LIVE = true
 *   2. Replace each stripeUrl with actual buy.stripe.com/... link
 *   3. Push — all sites update automatically
 *   Estimated swap time: 10 minutes
 *
 * WHY THIS USES window.EMPIRE_PAYMENTS INSTEAD OF process.env:
 *   These are static GitHub Pages sites (plain HTML/JS, no Node build step),
 *   so `process` does not exist in the browser — process.env.STRIPE_* would
 *   throw a ReferenceError on every page load. window.EMPIRE_PAYMENTS.STRIPE_PK
 *   below is the working equivalent: a single place to swap in the real key,
 *   read by every site via this one shared file. (The one real Next.js app in
 *   this repo, zprimedoxaihq-nextjs/, is the exception — it CAN use
 *   process.env.NEXT_PUBLIC_STRIPE_* at build time if that ever goes live.)
 *
 * PRICING MODEL (Derek's 2026-06-21 directive, applied where noted below):
 *   Entry ~$99 (one-time or /mo) → Mid ~$299-499 → Premium ~$999 → Enterprise (custom quote).
 *   Already applied to: omniaguard, ccldr, zprimedox, techpetcage, vaultvelocityauto.
 *   Not yet applied to every other floor's site copy — this file establishes the
 *   template; remaining floors' on-page pricing still needs an individual pass.
 *
 * LOOP RULES (enforced — never cross-contaminate):
 *   Loop A: Derek Francisco is visible — paypal.me/techpetcage/AMOUNT, Interac = franciscoderek7@gmail.com
 *   Loop B: Anonymous service identity — Interac = service-specific email. Per Derek's
 *           2026-06-28 directive ("all PayPal links empire-wide → paypal.me/techpetcage"),
 *           Loop B plans now also get a direct paypal.me/techpetcage/AMOUNT checkout link
 *           (falls back to inquiry email only for custom/null-price tiers).
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   * GLOBAL PAYMENT CONFIG
   * ───────────────────────────────────────────────────────────────────────── */
  window.EMPIRE_PAYMENTS = {

    // ── STRIPE SWAP ZONE ─────────────────────────────────────────────────────
    STRIPE_LIVE: false,                          // flip to true when [STRIPE-ACCT-REDACTED] is unlocked
    STRIPE_PK:   'pk_live_51TG0cIASsTLqnu8V...', // live publishable key — replace with full key on unlock
    // ─────────────────────────────────────────────────────────────────────────

    // ── CRYPTO ───────────────────────────────────────────────────────────────
    BTC: 'bc1qqdjsf6senn899jmrav2x6hd32q94ma5ukh6z4x',
    ETH: null, // coming soon

    /* ───────────────────────────────────────────────────────────────────────
     * SERVICES
     * ─────────────────────────────────────────────────────────────────────── */
    services: {

      /* ── OMNIAGUARD ────────────────────────────────────────────────────────
       * Loop B — anonymous. Never expose Derek's PayPal.me here.
       * ─────────────────────────────────────────────────────────────────────*/
      // PRICING REVISED 2026-06-21 per Derek's 3-tier directive (entry/mid/premium).
      // Previous 6-tier Starter/Sentinel/Warden/Archon/Sovereign/Imperium structure
      // is preserved in git history if a future session needs to restore it.
      omniaguard: {
        loop:    'B',
        contact: 'omniaguard1@gmail.com',
        interacEmail: 'omniaguard1@gmail.com',
        plans: {
          entry: {
            label:          'Entry',
            price:          99,
            recurring:      'mo',
            stripeUrl:      'https://buy.stripe.com/PLACEHOLDER_OMNIGUARD_ENTRY', // STRIPE SWAP ZONE
            paypal:         'https://paypal.me/techpetcage/99CAD',
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniGuard+Entry+%2499%2Fmo',
          },
          mid: {
            label:          'Mid',
            price:          299,
            recurring:      'mo',
            stripeUrl:      'https://buy.stripe.com/PLACEHOLDER_OMNIGUARD_MID', // STRIPE SWAP ZONE
            paypal:         'https://paypal.me/techpetcage/299CAD',
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniGuard+Mid+%24299%2Fmo',
          },
          premium: {
            label:          'Premium',
            price:          999,
            recurring:      'mo',
            stripeUrl:      'https://buy.stripe.com/PLACEHOLDER_OMNIGUARD_PREMIUM', // STRIPE SWAP ZONE
            paypal:         'https://paypal.me/techpetcage/999CAD',
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniGuard+Premium+%24999%2Fmo',
          },
          enterprise: {
            label:          'Enterprise',
            price:          null, // custom quote
            recurring:      'mo',
            stripeUrl:      null, // custom — contact required
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniGuard+Enterprise+Inquiry',
          },
        },
      },

      /* ── VIGILAX ───────────────────────────────────────────────────────────
       * Loop B — anonymous. Never expose Derek's PayPal.me here.
       * ─────────────────────────────────────────────────────────────────────*/
      vigilax: {
        loop:         'B',
        contact:      'omniaguard1@gmail.com',
        interacEmail: 'omniaguard1@gmail.com',
        plans: {
          scout: {
            label:         'Scout',
            price:         299,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_VIGILAX_SCOUT', // STRIPE SWAP ZONE
            paypal:        'https://paypal.me/techpetcage/299CAD',
            paypalInquiry: 'mailto:omniaguard1@gmail.com?subject=Vigilax+Scout+%24299%2Fmo',
          },
          guardian: {
            label:         'Guardian',
            price:         899,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_VIGILAX_GUARDIAN', // STRIPE SWAP ZONE
            paypal:        'https://paypal.me/techpetcage/899CAD',
            paypalInquiry: 'mailto:omniaguard1@gmail.com?subject=Vigilax+Guardian+%24899%2Fmo',
          },
          phantom: {
            label:         'Phantom',
            price:         2499,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_VIGILAX_PHANTOM', // STRIPE SWAP ZONE
            paypal:        'https://paypal.me/techpetcage/2499CAD',
            paypalInquiry: 'mailto:omniaguard1@gmail.com?subject=Vigilax+Phantom+%242499%2Fmo',
          },
          sovereign: {
            label:         'Sovereign',
            price:         null, // custom
            recurring:     'mo',
            stripeUrl:     null, // custom — contact required
            paypalInquiry: 'mailto:omniaguard1@gmail.com?subject=Vigilax+Sovereign+Plan+Inquiry',
          },
        },
      },

      /* ── KIAROS ────────────────────────────────────────────────────────────
       * Loop B — anonymous. Never expose Derek's PayPal.me here.
       * ─────────────────────────────────────────────────────────────────────*/
      kiaros: {
        loop:         'B',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          spark: {
            label:         'Spark',
            price:         0,
            recurring:     'mo',
            stripeUrl:     null, // free — no payment
            paypalInquiry: null, // free — no payment
          },
          professional: {
            label:         'Professional',
            price:         79,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_KIAROS_PROFESSIONAL', // STRIPE SWAP ZONE
            paypal:        'https://paypal.me/techpetcage/79CAD',
            paypalInquiry: 'mailto:franciscoderek7@gmail.com?subject=Kiaros+Professional+%2479%2Fmo',
          },
          enterprise: {
            label:         'Enterprise',
            price:         249,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_KIAROS_ENTERPRISE', // STRIPE SWAP ZONE
            paypal:        'https://paypal.me/techpetcage/249CAD',
            paypalInquiry: 'mailto:franciscoderek7@gmail.com?subject=Kiaros+Enterprise+%24249%2Fmo',
          },
          sovereign: {
            label:         'Sovereign',
            price:         999,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_KIAROS_SOVEREIGN', // STRIPE SWAP ZONE
            paypal:        'https://paypal.me/techpetcage/999CAD',
            paypalInquiry: 'mailto:franciscoderek7@gmail.com?subject=Kiaros+Sovereign+%24999%2Fmo',
          },
        },
      },

      /* ── CCLDR (Doc Weedlaw) ───────────────────────────────────────────────
       * Loop A — Derek Francisco visible. Uses paypal.me/techpetcage.
       * PRICING REVISED 2026-06-21: digital/premium/elite 3-tier per Derek's
       * directive. Previous Basic/Warrior/Professional/Elite/Sovereign 5-tier
       * structure is preserved in git history.
       * ─────────────────────────────────────────────────────────────────────*/
      ccldr: {
        loop:         'A',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          digital: {
            label:    'Digital',
            price:    99,
            recurring:null, // one-time
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_DIGITAL', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/99CAD',
          },
          premium: {
            label:    'Premium',
            price:    499,
            recurring:null, // one-time
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_PREMIUM', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/499CAD',
          },
          elite: {
            label:    'Elite',
            price:    1499,
            recurring:null, // one-time
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_ELITE', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/1499CAD',
          },
        },
      },

      /* ── ZPRIMEDOXAIHQ (PrimeDox AI) ────────────────────────────────────────
       * Loop A — Derek Francisco visible. Uses paypal.me/techpetcage.
       * PRICING REVISED 2026-06-21 per Derek's 3-tier directive.
       * ─────────────────────────────────────────────────────────────────────*/
      zprimedox: {
        loop:         'A',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          individual: {
            label:    'Individual',
            price:    49,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_ZPRIMEDOX_INDIVIDUAL', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/49CAD',
          },
          team: {
            label:    'Team',
            price:    149,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_ZPRIMEDOX_TEAM', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/149CAD',
          },
          enterprise: {
            label:    'Enterprise',
            price:    499,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_ZPRIMEDOX_ENTERPRISE', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/499CAD',
          },
        },
      },

      /* ── TECHPETCAGE ───────────────────────────────────────────────────────
       * Loop A — Derek Francisco visible. Uses paypal.me/techpetcage.
       * PRICING REVISED 2026-06-21 per Derek's 3-tier directive. The
       * marketplace (per-item, amount-at-checkout) model is kept separately
       * below since real product listings still need their own Stripe links.
       * ─────────────────────────────────────────────────────────────────────*/
      techpetcage: {
        loop:         'A',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          basic: {
            label:    'Basic',
            price:    199,
            recurring:null, // one-time
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_TECHPETCAGE_BASIC', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/199CAD',
          },
          premium: {
            label:    'Premium',
            price:    499,
            recurring:null, // one-time
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_TECHPETCAGE_PREMIUM', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/499CAD',
          },
          enterprise: {
            label:    'Enterprise',
            price:    999,
            recurring:null, // one-time
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_TECHPETCAGE_ENTERPRISE', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/999CAD',
          },
          marketplace: {
            label:    'Marketplace',
            price:    null, // products vary
            recurring: null,
            stripeUrl: null, // product-level Stripe links applied per item — STRIPE SWAP ZONE
            paypal:    'https://www.paypal.com/paypalme/techpetcage?country.x=CA&locale.x=en_CA', // amount appended dynamically at checkout
          },
        },
      },

      /* ── VAULT VELOCITY AUTO ────────────────────────────────────────────────
       * Loop A — Derek Francisco visible. Uses paypal.me/techpetcage.
       * Matches the live luxury-marketplace front page (vault-velocity-auto-site/
       * index.html, rebuilt 2026-06-21): listing fee + featured add-on + premium
       * seller tier, 5% commission tracked separately via referral-engine.js.
       * ─────────────────────────────────────────────────────────────────────*/
      vaultvelocityauto: {
        loop:         'A',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          listing: {
            label:    'Standard Listing',
            price:    99,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_VVA_LISTING', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/99CAD',
          },
          featured: {
            label:    'Featured Listing',
            price:    499,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_VVA_FEATURED', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/499CAD',
          },
          premiumSeller: {
            label:    'Premium Seller',
            price:    999,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_VVA_PREMIUM_SELLER', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/techpetcage/999CAD',
          },
        },
      },

    }, // end services

  }; // end window.EMPIRE_PAYMENTS


  /* ─────────────────────────────────────────────────────────────────────────
   * HELPER: getPaymentUrl(service, plan)
   *
   * Returns the active payment URL for a given service/plan combination.
   *   - If STRIPE_LIVE === true and a stripeUrl exists → return stripeUrl
   *   - Loop A (Derek visible)  → return paypal URL (paypal.me/techpetcage/AMOUNT)
   *   - Loop B (anonymous)      → return paypal URL if priced, else paypalInquiry mailto
   *   - Free plans              → return null (no payment URL)
   *   - Custom/null price       → return contact mailto
   * ───────────────────────────────────────────────────────────────────────── */
  window.EMPIRE_PAYMENTS.getPaymentUrl = function (service, plan) {
    var cfg  = window.EMPIRE_PAYMENTS;
    var svc  = cfg.services[service];
    if (!svc) { console.warn('[stripe-config] Unknown service: ' + service); return null; }

    var p = svc.plans[plan];
    if (!p)   { console.warn('[stripe-config] Unknown plan: ' + plan + ' on service: ' + service); return null; }

    // Free plan — no URL needed
    if (p.price === 0) { return null; }

    // Stripe is live and a Stripe URL is set → use Stripe
    if (cfg.STRIPE_LIVE && p.stripeUrl && p.stripeUrl.indexOf('PLACEHOLDER') === -1) {
      return p.stripeUrl;
    }

    // Loop A → direct PayPal.me link
    if (svc.loop === 'A') {
      return p.paypal || null;
    }

    // Loop B → direct PayPal.me link if priced, else inquiry email for custom/null-price tiers
    if (svc.loop === 'B') {
      return p.paypal || p.paypalInquiry || ('mailto:' + svc.contact + '?subject=' + encodeURIComponent(service + ' ' + plan + ' inquiry'));
    }

    return null;
  };


  /* ─────────────────────────────────────────────────────────────────────────
   * HELPER: getInteracInstructions(service, plan, amount)
   *
   * Returns a plain-text Interac e-Transfer instructions string.
   *   - Loop A: send to franciscoderek7@gmail.com, message = service + plan
   *   - Loop B: send to service-specific interacEmail, message = service + plan
   *   - amount: pass null for custom-priced plans (instruction will say "agreed amount")
   * ───────────────────────────────────────────────────────────────────────── */
  window.EMPIRE_PAYMENTS.getInteracInstructions = function (service, plan, amount) {
    var cfg = window.EMPIRE_PAYMENTS;
    var svc = cfg.services[service];
    if (!svc) { console.warn('[stripe-config] Unknown service: ' + service); return ''; }

    var p           = svc.plans[plan];
    var email       = svc.interacEmail;
    var displayAmt  = (amount !== null && amount !== undefined) ? ('$' + amount) : 'the agreed amount';
    var planLabel   = (p && p.label) ? p.label : plan;
    var svcLabel    = service.charAt(0).toUpperCase() + service.slice(1);

    return [
      'Interac e-Transfer Instructions',
      '─────────────────────────────────',
      'Send to:  ' + email,
      'Amount:   ' + displayAmt,
      'Message:  ' + svcLabel + ' — ' + planLabel + ' Plan',
      '',
      'No security question needed — auto-deposit is enabled.',
      'Please send a confirmation email to ' + email + ' once the transfer is complete.',
      'Your account will be activated within 24 hours of receipt.',
    ].join('\n');
  };

})();
