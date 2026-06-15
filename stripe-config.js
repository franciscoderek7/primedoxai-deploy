/* stripe-config.js — Francisco Holdings Empire Payment Config
 * STRIPE SWAP ZONE: When acct_1TG0cIASsTLqnu8V is unlocked:
 *   1. Set STRIPE_LIVE = true
 *   2. Replace each stripeUrl with actual buy.stripe.com/... link
 *   3. Push — all sites update automatically
 *   Estimated swap time: 10 minutes
 *
 * LOOP RULES (enforced — never cross-contaminate):
 *   Loop A: Derek Francisco is visible — paypal.me/derekfrancisco/AMOUNT, Interac = franciscoderek7@gmail.com
 *   Loop B: Anonymous service identity — PayPal inquiry email only, Interac = service-specific email
 *            NEVER use paypal.me/derekfrancisco on Loop B.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   * GLOBAL PAYMENT CONFIG
   * ───────────────────────────────────────────────────────────────────────── */
  window.EMPIRE_PAYMENTS = {

    // ── STRIPE SWAP ZONE ─────────────────────────────────────────────────────
    STRIPE_LIVE: false,                          // flip to true when acct_1TG0cIASsTLqnu8V is unlocked
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
      omniaguard: {
        loop:    'B',
        contact: 'omniaguard1@gmail.com',
        interacEmail: 'omniaguard1@gmail.com',
        plans: {
          starter: {
            label:          'Starter',
            price:          99,
            recurring:      'mo',
            stripeUrl:      'https://buy.stripe.com/PLACEHOLDER_OMNIAGUARD_STARTER', // STRIPE SWAP ZONE
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniaGuard+Starter+%2499%2Fmo',
          },
          sentinel: {
            label:          'Sentinel',
            price:          499,
            recurring:      'mo',
            stripeUrl:      'https://buy.stripe.com/PLACEHOLDER_OMNIAGUARD_SENTINEL', // STRIPE SWAP ZONE
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniaGuard+Sentinel+%24499%2Fmo',
          },
          warden: {
            label:          'Warden',
            price:          2499,
            recurring:      'mo',
            stripeUrl:      'https://buy.stripe.com/PLACEHOLDER_OMNIAGUARD_WARDEN', // STRIPE SWAP ZONE
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniaGuard+Warden+%242499%2Fmo',
          },
          archon: {
            label:          'Archon',
            price:          9999,
            recurring:      'mo',
            stripeUrl:      'https://buy.stripe.com/PLACEHOLDER_OMNIAGUARD_ARCHON', // STRIPE SWAP ZONE
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniaGuard+Archon+%249999%2Fmo',
          },
          sovereign: {
            label:          'Sovereign',
            price:          null, // custom
            recurring:      'mo',
            stripeUrl:      null, // custom — contact required
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniaGuard+Sovereign+Plan+Inquiry',
          },
          imperium: {
            label:          'Imperium',
            price:          null, // custom enterprise
            recurring:      'mo',
            stripeUrl:      null, // custom — contact required
            paypalInquiry:  'mailto:omniaguard1@gmail.com?subject=OmniaGuard+Imperium+Enterprise+Inquiry',
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
            paypalInquiry: 'mailto:omniaguard1@gmail.com?subject=Vigilax+Scout+%24299%2Fmo',
          },
          guardian: {
            label:         'Guardian',
            price:         899,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_VIGILAX_GUARDIAN', // STRIPE SWAP ZONE
            paypalInquiry: 'mailto:omniaguard1@gmail.com?subject=Vigilax+Guardian+%24899%2Fmo',
          },
          phantom: {
            label:         'Phantom',
            price:         2499,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_VIGILAX_PHANTOM', // STRIPE SWAP ZONE
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
        contact:      'hello@kiaros.com',
        interacEmail: 'hello@kiaros.com',
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
            paypalInquiry: 'mailto:hello@kiaros.com?subject=Kiaros+Professional+%2479%2Fmo',
          },
          enterprise: {
            label:         'Enterprise',
            price:         249,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_KIAROS_ENTERPRISE', // STRIPE SWAP ZONE
            paypalInquiry: 'mailto:hello@kiaros.com?subject=Kiaros+Enterprise+%24249%2Fmo',
          },
          sovereign: {
            label:         'Sovereign',
            price:         999,
            recurring:     'mo',
            stripeUrl:     'https://buy.stripe.com/PLACEHOLDER_KIAROS_SOVEREIGN', // STRIPE SWAP ZONE
            paypalInquiry: 'mailto:hello@kiaros.com?subject=Kiaros+Sovereign+%24999%2Fmo',
          },
        },
      },

      /* ── CCLDR (Doc Weedlaw) ───────────────────────────────────────────────
       * Loop A — Derek Francisco visible. Uses paypal.me/derekfrancisco.
       * ─────────────────────────────────────────────────────────────────────*/
      ccldr: {
        loop:         'A',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          basic: {
            label:    'Basic',
            price:    49,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_BASIC', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/49',
          },
          warrior: {
            label:    'Warrior',
            price:    149,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_WARRIOR', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/149',
          },
          professional: {
            label:    'Professional',
            price:    499,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_PROFESSIONAL', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/499',
          },
          elite: {
            label:    'Elite',
            price:    999,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_ELITE', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/999',
          },
          sovereign: {
            label:    'Sovereign',
            price:    2499,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_CCLDR_SOVEREIGN', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/2499',
          },
        },
      },

      /* ── ZPRIMEDOXAIHQ ─────────────────────────────────────────────────────
       * Loop A — Derek Francisco visible. Uses paypal.me/derekfrancisco.
       * ─────────────────────────────────────────────────────────────────────*/
      zprimedox: {
        loop:         'A',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          individual: {
            label:    'Individual',
            price:    199,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_ZPRIMEDOX_INDIVIDUAL', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/199',
          },
          team: {
            label:    'Team',
            price:    499,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_ZPRIMEDOX_TEAM', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/499',
          },
          enterprise: {
            label:    'Enterprise',
            price:    1999,
            recurring:'mo',
            stripeUrl:'https://buy.stripe.com/PLACEHOLDER_ZPRIMEDOX_ENTERPRISE', // STRIPE SWAP ZONE
            paypal:   'https://paypal.me/derekfrancisco/1999',
          },
        },
      },

      /* ── TECHPETCAGE ───────────────────────────────────────────────────────
       * Loop A — Derek Francisco visible. Uses paypal.me/derekfrancisco.
       * Products vary — amount passed at purchase time.
       * ─────────────────────────────────────────────────────────────────────*/
      techpetcage: {
        loop:         'A',
        contact:      'franciscoderek7@gmail.com',
        interacEmail: 'franciscoderek7@gmail.com',
        plans: {
          marketplace: {
            label:    'Marketplace',
            price:    null, // products vary
            recurring: null,
            stripeUrl: null, // product-level Stripe links applied per item — STRIPE SWAP ZONE
            paypal:    'https://paypal.me/derekfrancisco', // amount appended dynamically at checkout
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
   *   - Loop A (Derek visible)  → return paypal URL (paypal.me/derekfrancisco/AMOUNT)
   *   - Loop B (anonymous)      → return paypalInquiry mailto link
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

    // Loop B → inquiry email (never expose Derek's PayPal.me)
    if (svc.loop === 'B') {
      return p.paypalInquiry || ('mailto:' + svc.contact + '?subject=' + encodeURIComponent(service + ' ' + plan + ' inquiry'));
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
