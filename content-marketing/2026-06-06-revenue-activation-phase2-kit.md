# Revenue Activation — Phase 2 Kit
**Drafted for Derek Francisco / Doc Weedlaw — June 6, 2026**

> Continuation of `2026-06-06-revenue-activation-master-kit.md`. Three deliverables below: fresh OmniaGuard posts in the anonymous "team" voice, a copy-paste cross-promo snippet (sticky header + footer block + exit-intent popup) to drop into your live site templates, and Stripe/MDG follow-up email templates for the account-recovery thread. As always — copy-paste only. I can't post, deploy, send email, or log into any payment dashboard.

---

## 1. OMNIAGUARD — ANONYMOUS-VOICE POSTS (5, fresh — distinct from the email sequence)

*Per the zero-bleed rule (CLAUDE.md): zero Derek Francisco branding, zero cannabis references, anonymous "team" voice. Use these on OmniaGuard's own LinkedIn/X/Facebook presence — do NOT cross-post these under Derek's personal accounts.*

**1 — The stat that should worry every CTO**
> The agentic-AI security market is projected at $7.38B — and it's growing because the threat is real, not theoretical. Most companies running AI agents have no idea what their attack surface actually looks like until something goes wrong. We built OmniaGuard to change that. Free audits open this week — comment "AUDIT" for the link. 🔒

**2 — Prompt injection, explained in one line**
> Prompt injection isn't a hacked server. It's an AI agent doing something it was never supposed to do — because of a few cleverly worded sentences buried in a document, email, or webpage it processed. Most teams don't know it's happening to them. That's the gap we close.

**3 — Why one model can't police itself**
> Would you trust a single guard to watch every door in a building, all night, alone? That's what most "AI safety" amounts to today — one model checking its own work. OmniaGuard runs a 14-agent defense swarm instead: layered, coordinated, watching every input in real time. No single point of failure.

**4 — The question every AI deployment skips**
> Before you ask "what can our AI agent do for us," ask "what could someone else make our AI agent do FOR THEM." That second question is the one most security reviews skip — and it's the one that actually matters once an agent is processing real customer data. Free stack audit this week: comment "AUDIT."

**5 — Direct offer / urgency**
> Running AI agents in production and haven't stress-tested them against manipulated inputs? That's the #1 finding in our free audits right now. Takes our team about 20 minutes to map your exposure — no jargon, no upsell pressure, just the findings. Comment "AUDIT" or DM us to get prioritized this week.

---

## 2. CROSS-PROMO TRAFFIC LOOP — STICKY HEADER + FOOTER BLOCK + EXIT-INTENT POPUP

**What this does:** keeps a visitor who lands on one of your properties from leaving without seeing the others — a thin promo bar at the top, a cross-link block in the footer, and a one-time exit-intent popup when the cursor heads for the tab bar. All three remember (via `localStorage`) that a visitor already saw them, so nobody gets nagged twice.

**Zero-bleed compliance — READ BEFORE YOU PASTE ANYTHING:**
This snippet is brand-agnostic, but the *content* you put in it is not. Per CLAUDE.md, cross-linking across the wrong brand pairs is a "critical failure," not a style choice. There are two safe loops — **never mix them**:

| Loop | Properties (safe to cross-link to each other) | Why |
|---|---|---|
| **Loop A — "Derek's voice" properties** | CCLDR.net, PrimeDox AI, Weedlaw Education, Francisco Holdings | All already carry Derek Francisco's identity and/or cannabis-education content — no new exposure created by linking them together |
| **Loop B — Anonymous / no-cannabis properties** | OmniaGuard, Kiaros, SoulStack, CleanSwarm | None carry Derek's personal identity or cannabis content — safe to cross-promote as a "Francisco Holdings portfolio" without naming Derek |

Do **not** place a Loop A link/banner on any Loop B site (or vice versa) — that's the exact cross-contamination CLAUDE.md prohibits (e.g., OmniaGuard visitors must never see a CCLDR link, and CCLDR visitors must never see "AI security" framing that bleeds into Derek's anonymous brands).

### 2a. Drop-in CSS (works for both loops — paste once per site, in `<head>`)

```html
<style>
  /* ===== Cross-Promo Traffic Loop — shared styles ===== */
  .xp-bar {
    position: sticky; top: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 10px 16px; font: 600 14px/1.4 system-ui, sans-serif;
    text-align: center;
  }
  .xp-bar a { color: inherit; text-decoration: underline; font-weight: 700; }
  .xp-bar .xp-close {
    position: absolute; right: 14px; background: none; border: none;
    font-size: 18px; cursor: pointer; color: inherit; opacity: 0.7;
  }
  .xp-bar .xp-close:hover { opacity: 1; }

  .xp-footer-block {
    padding: 28px 16px; text-align: center; font: 400 14px/1.6 system-ui, sans-serif;
    border-top: 1px solid rgba(128,128,128,0.25);
  }
  .xp-footer-block h4 { margin: 0 0 10px; font-size: 13px; letter-spacing: 0.08em;
    text-transform: uppercase; opacity: 0.65; }
  .xp-footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 18px; }
  .xp-footer-links a { text-decoration: none; font-weight: 600; opacity: 0.85; }
  .xp-footer-links a:hover { opacity: 1; text-decoration: underline; }

  .xp-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000;
    display: none; align-items: center; justify-content: center; padding: 20px;
  }
  .xp-modal-overlay.xp-show { display: flex; }
  .xp-modal {
    background: #fff; color: #111; max-width: 420px; width: 100%;
    border-radius: 12px; padding: 28px; text-align: center;
    font: 400 15px/1.6 system-ui, sans-serif; position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  }
  .xp-modal h3 { margin: 0 0 10px; font-size: 20px; }
  .xp-modal a.xp-cta {
    display: inline-block; margin-top: 16px; padding: 12px 26px;
    border-radius: 8px; font-weight: 700; text-decoration: none;
  }
  .xp-modal .xp-modal-close {
    position: absolute; top: 10px; right: 14px; background: none; border: none;
    font-size: 20px; cursor: pointer; color: #666;
  }
</style>
```

### 2b. Drop-in HTML + JS (paste once, right after `<body>` opens — edit the `XP_CONFIG` block per site)

```html
<!-- ===== Cross-Promo Traffic Loop — config: EDIT THESE VALUES PER SITE ===== -->
<script>
  // Pick ONE row below for the site you're pasting into — delete the other.
  // LOOP A example (paste on a "Derek's voice" property, e.g. CCLDR):
  var XP_CONFIG = {
    siteId: "ccldr",                                  // unique id — prevents cross-loop popup collisions
    barText: "Need help understanding what's happening to you, 24/7? ",
    barLinkText: "Try PrimeDox AI →",
    barLinkUrl: "https://primedoxai.com",
    barColors: { bg: "#1a1a1a", fg: "#f5f5f5" },
    footerHeading: "More from Francisco Holdings",
    footerLinks: [
      { label: "PrimeDox AI — 24/7 Defense Assistant", url: "https://primedoxai.com" },
      { label: "Weedlaw Education — Course Library", url: "https://weedlaw-education" /* confirm live domain */ },
      { label: "Francisco Holdings — Investor Relations", url: "https://franciscoholdings.com/investors.html" }
    ],
    modal: {
      heading: "Before you go —",
      body: "If you're facing a charge right now, PrimeDox can walk you through what's coming next — 24/7, no waiting room.",
      ctaText: "Get Emergency Defense — $99",
      ctaUrl: "https://primedoxai.com/emergency-defense.html",
      ctaColors: { bg: "#c9a84c", fg: "#111" }
    }
  };

  // LOOP B example (paste on an anonymous property, e.g. OmniaGuard) — uncomment & use instead:
  // var XP_CONFIG = {
  //   siteId: "omniaguard",
  //   barText: "Free 14-day trial for cleaning-business owners — ",
  //   barLinkText: "See CleanSwarm →",
  //   barLinkUrl: "https://cleanswarm.ca",
  //   barColors: { bg: "#0d1b2a", fg: "#e8eef4" },
  //   footerHeading: "Also from the Francisco Holdings portfolio",
  //   footerLinks: [
  //     { label: "CleanSwarm — Operations Automation", url: "https://cleanswarm.ca" },
  //     { label: "Kiaros — AI Consulting", url: "https://kiaros.ai" }
  //   ],
  //   modal: {
  //     heading: "One more thing —",
  //     body: "Run a cleaning business? CleanSwarm gives owners back 5-10 hours a week on scheduling — free 14-day trial, no card needed.",
  //     ctaText: "Start Free Trial",
  //     ctaUrl: "https://cleanswarm.ca/for-cleaning-businesses.html",
  //     ctaColors: { bg: "#2e9e6b", fg: "#fff" }
  //   }
  // };
</script>

<!-- Sticky top bar -->
<div class="xp-bar" id="xp-bar" style="display:none;">
  <span><span id="xp-bar-text"></span><a id="xp-bar-link" href="#" target="_blank" rel="noopener"></a></span>
  <button class="xp-close" id="xp-bar-close" aria-label="Dismiss">&times;</button>
</div>

<!-- Exit-intent modal (markup lives here, shown via JS) -->
<div class="xp-modal-overlay" id="xp-modal-overlay">
  <div class="xp-modal">
    <button class="xp-modal-close" id="xp-modal-close" aria-label="Close">&times;</button>
    <h3 id="xp-modal-heading"></h3>
    <p id="xp-modal-body"></p>
    <a class="xp-cta" id="xp-modal-cta" href="#" target="_blank" rel="noopener"></a>
  </div>
</div>

<script>
(function () {
  var cfg = XP_CONFIG;
  var barKey = "xp_bar_dismissed_" + cfg.siteId;
  var modalKey = "xp_modal_seen_" + cfg.siteId;

  // --- Sticky bar ---
  var bar = document.getElementById("xp-bar");
  if (!localStorage.getItem(barKey)) {
    document.getElementById("xp-bar-text").textContent = cfg.barText;
    var barLink = document.getElementById("xp-bar-link");
    barLink.textContent = cfg.barLinkText;
    barLink.href = cfg.barLinkUrl;
    bar.style.background = cfg.barColors.bg;
    bar.style.color = cfg.barColors.fg;
    bar.style.display = "flex";
  }
  document.getElementById("xp-bar-close").addEventListener("click", function () {
    localStorage.setItem(barKey, "1");
    bar.style.display = "none";
  });

  // --- Exit-intent modal (desktop: mouse leaves toward the tab bar; fires once) ---
  var overlay = document.getElementById("xp-modal-overlay");
  function showModal() {
    if (localStorage.getItem(modalKey)) return;
    document.getElementById("xp-modal-heading").textContent = cfg.modal.heading;
    document.getElementById("xp-modal-body").textContent = cfg.modal.body;
    var cta = document.getElementById("xp-modal-cta");
    cta.textContent = cfg.modal.ctaText;
    cta.href = cfg.modal.ctaUrl;
    cta.style.background = cfg.modal.ctaColors.bg;
    cta.style.color = cfg.modal.ctaColors.fg;
    overlay.classList.add("xp-show");
    localStorage.setItem(modalKey, "1");
  }
  function closeModal() { overlay.classList.remove("xp-show"); }
  document.getElementById("xp-modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget && e.clientY < 10) showModal();
  });
  // Mobile fallback: trigger on back-button intent (visibility change) instead of mouseout
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") showModal();
  });
})();
</script>
```

### 2c. Footer cross-promo block (paste inside your existing `<footer>`)

```html
<div class="xp-footer-block">
  <h4 id="xp-footer-heading"></h4>
  <div class="xp-footer-links" id="xp-footer-links"></div>
</div>
<script>
(function () {
  var cfg = XP_CONFIG;
  document.getElementById("xp-footer-heading").textContent = cfg.footerHeading;
  var wrap = document.getElementById("xp-footer-links");
  cfg.footerLinks.forEach(function (l) {
    var a = document.createElement("a");
    a.href = l.url; a.textContent = l.label; a.target = "_blank"; a.rel = "noopener";
    wrap.appendChild(a);
  });
})();
</script>
```

**To activate on a site:** paste 2a in `<head>`, paste 2b right after `<body>` opens, paste 2c inside the existing `<footer>`, then edit the `XP_CONFIG` object to match that site's loop (A or B) and live URLs. Test in an incognito window — the bar/modal should appear once, then stay dismissed on reload (that's the `localStorage` keys working).

---

## 3. STRIPE / MDG FOLLOW-UP EMAIL TEMPLATES

*From the Hour 1 checklist in the Master Kit. Two templates: the initial MDG fee-waiver/dispute email, and a 48-hour follow-up if you don't hear back. Fill in the bracketed details before sending — I don't have your case number, dispute reference, or the exact NSF date.*

### Template 1 — Initial email to finance@mdg.ca

**To:** finance@mdg.ca
**Subject:** Order #8600918 — NSF Fee Dispute & Reschedule Request — [Your Account/Case #]

Hi MDG Finance Team,

I'm writing about order **#8600918** on my account ([Account/Case #: ___]).

A **$35 NSF fee** was applied to this order on [date]. I'd like to request that this fee be waived — [reason: e.g., "the failed payment was due to a temporary bank-side hold that's since cleared" / "this was a timing issue on a linked account that's now corrected"].

I'd also like to **reschedule order #8600918** rather than cancel it — please let me know the earliest available date and what you need from me to confirm it.

I can be reached at this email or at 705-307-8080, and I'm happy to provide any documentation needed (bank confirmation, account verification, etc.) to resolve this quickly.

Thanks for your help,
Derek Francisco
Tech Pet Cage / Francisco Holdings Inc.
franciscoderek7@gmail.com | 705-307-8080
Kent Street West, Lindsay, Ontario K9V 2Z8

---

### Template 2 — 48-hour follow-up (if no reply)

**To:** finance@mdg.ca
**Subject:** Re: Order #8600918 — NSF Fee Dispute & Reschedule Request — Following Up

Hi MDG Finance Team,

Following up on my note from [date] regarding order **#8600918** — the $35 NSF fee waiver request and the reschedule.

I know these things take time to route internally, so just flagging it's still open on my end. If there's a better contact or process for this kind of request, I'm glad to redirect there instead.

Appreciate the help — happy to hop on a quick call if that's faster.

Derek Francisco
Tech Pet Cage / Francisco Holdings Inc.
franciscoderek7@gmail.com | 705-307-8080

---

### Template 3 — Stripe support follow-up (if account recovery stalls past 48 hours)

*Use this only if `dashboard.stripe.com/recover` doesn't resolve things on its own — it's a follow-up to whatever the recovery flow already started, not a replacement for `STRIPE-REPLY-TEMPLATE.md` (use that one first if you're replying to an actual review email).*

**Subject:** Re: Account Recovery — Tech Pet Cage — Status Check

Hello Stripe Support,

I started the account recovery process for **Tech Pet Cage** on [date] (case/reference #: [___ if you have one]) and uploaded the requested government ID.

I wanted to check on the status — I have a **$406.80 refund** pending payout to my linked bank account and want to make sure nothing further is needed from my side to release it.

Happy to provide anything else that helps move this along. You can reach me at this email or 705-307-8080.

Thanks for your time,
Derek Francisco
Owner, Tech Pet Cage
franciscoderek7@gmail.com | 705-307-8080
Kent Street West, Lindsay, Ontario K9V 2Z8

---

## NOTES — what's in this file vs. what's deferred

- **What's here:** the three items above — they're scoped to "ready in minutes," matching the "money this week" goal.
- **Deferred (and why):**
  - **Super Highway build-out** — this reads as a larger architectural/infrastructure project, not a copy-paste deliverable. It needs its own scoping conversation before I'd build anything, so I haven't started it.
  - **Social profile creation** — I have no ability to create or log into social accounts on your behalf (per CLAUDE.md: "Send emails, messages, or post to any external service" requires your direct action).
  - **Trademark/domain registration** — both are purchases/legal filings ("Register domains or make purchases" is explicitly outside what I can do without your sign-off, and a trademark filing is a legal action that needs your name on it, not mine).
- **Bracketed fields in Section 3:** I don't have your MDG case/account number or the exact NSF date — fill those in before sending, or the email reads as incomplete to their support team.
- **Personal info in Section 3:** these are private 1:1 emails to MDG/Stripe support, not public-facing content — including your phone/address there is correct and doesn't violate the zero-bleed rule (that rule governs *public* sites).
