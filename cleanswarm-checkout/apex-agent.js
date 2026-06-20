// apex-agent.js — APEX (Algorithm & Pipeline EXposure) v1.0
// Local copy for CleanSwarm (Loop B / anonymous) — not loaded from the
// primedoxai-deploy CDN here, so the build-time identity check never sees
// a "franciscoderek7" string in this anonymous site's HTML.
//
// WHAT THIS FILE ACTUALLY DOES (client-side, no backend/API keys required):
//   - SEO helper: inject meta description/keywords + Schema.org JSON-LD on demand
//   - Exit-intent lead capture popup -> Formspree (same honest placeholder pattern
//     as agents/payment-provider.js / vigilax-site/pricing.html trial capture)
//   - Local lead scoring (cold/warm/hot) based on time-on-page + interaction count
//   - Social share buttons (Twitter/X, LinkedIn, Facebook) using native share-intent
//     URLs — no API keys needed because these just open the platform's own share dialog
//   - Urgency/scarcity countdown timer widget
//   - Honest social-proof widget: rotates real testimonials you supply, and/or
//     displays a count YOU supply — it does not fabricate or auto-escalate numbers
//   - Local event log (localStorage) + optional Supabase mirror (same graceful
//     no-op pattern as agents/referral-engine.js) feeding Apex.getLocalStats()
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO (would require credentials/infra
// that do not exist anywhere in this repo — flagged in EMPIRE.md, not faked):
//   - Does NOT auto-post to Twitter/X, LinkedIn, or Facebook (needs OAuth app +
//     API keys for each platform — none exist here)
//   - Does NOT send automated email drip sequences (needs an email service like
//     SendGrid/Mailchimp + backend — none exist here; captured leads still reach
//     Derek via the same Formspree-forwards-to-email pattern used elsewhere)
//   - Does NOT auto-submit sitemaps to Google/Bing Search Console (needs Search
//     Console API auth — none exists here)
//   - Does NOT call a "Gemma 41B endpoint" (no such endpoint exists in this repo)
//   - getLocalStats() is PER-BROWSER ONLY (localStorage) — it is not a real
//     cross-visitor analytics/revenue-attribution dashboard. That needs a real
//     analytics service (GA4/Plausible) or the Supabase table wired up.

(function () {
  'use strict';

  var LS_EVENTS = 'apex_events';
  var LS_LEAD   = 'apex_lead';
  var LS_SEEN_EXIT = 'apex_exit_shown';

  // ─── Supabase Logging (graceful no-op, same pattern as referral-engine.js) ─
  function _supabaseInsert(table, record) {
    try {
      if (window.supabase && typeof window.supabase.from === 'function') {
        window.supabase.from(table).insert([record]).then(function () {}).catch(function () {});
      }
    } catch (e) {}
  }

  function _loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function _saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // ─── 1. SEO Helper ──────────────────────────────────────────────────────────
  // Injects/updates a meta tag and a Schema.org JSON-LD block. Real, works
  // immediately — no crawler/API access needed since this is just standard HTML.

  function injectSEO(opts) {
    opts = opts || {};

    if (opts.description) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', opts.description);
    }

    if (opts.keywords && opts.keywords.length) {
      var metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement('meta');
        metaKw.setAttribute('name', 'keywords');
        document.head.appendChild(metaKw);
      }
      metaKw.setAttribute('content', opts.keywords.join(', '));
    }

    if (opts.schema) {
      var existing = document.getElementById('apex-schema-ld');
      if (existing) existing.remove();
      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'apex-schema-ld';
      script.textContent = JSON.stringify(opts.schema);
      document.head.appendChild(script);
    }
  }

  // ─── 2. Lead Capture (exit-intent + inline) ────────────────────────────────

  var _engagement = { start: Date.now(), interactions: 0 };
  document.addEventListener('click', function () { _engagement.interactions++; }, true);

  function _leadScore() {
    var seconds = (Date.now() - _engagement.start) / 1000;
    var weight = seconds + (_engagement.interactions * 15);
    if (weight >= 90) return 'hot';
    if (weight >= 30) return 'warm';
    return 'cold';
  }

  function trackEvent(name, data) {
    try {
      var list = _loadJSON(LS_EVENTS, []);
      var entry = { name: name, data: data || {}, url: location.href, ts: Date.now() };
      list.push(entry);
      _saveJSON(LS_EVENTS, list.slice(-300));
      _supabaseInsert('apex_events', {
        name: name,
        data: data || {},
        url: location.href,
        ts: new Date().toISOString(),
      });
    } catch (e) {}
  }

  function captureLead(email, opts) {
    opts = opts || {};
    if (!email || email.indexOf('@') === -1) return false;

    var lead = {
      email: email,
      score: _leadScore(),
      magnet: opts.magnet || null,
      source: location.hostname + location.pathname,
      ts: Date.now(),
    };
    _saveJSON(LS_LEAD, lead);
    trackEvent('lead_captured', lead);

    // Forward to Formspree if a real form ID has been configured for this site.
    // Replace YOUR_FORM_ID with your Formspree form ID from formspree.io (free) —
    // same honest placeholder pattern used in vigilax-site/pricing.html.
    if (opts.formspreeId && opts.formspreeId !== 'YOUR_FORM_ID') {
      fetch('https://formspree.io/f/' + opts.formspreeId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(lead),
      }).catch(function () {});
    }
    return true;
  }

  // ─── 3. Exit-Intent Popup ───────────────────────────────────────────────────

  function initExitIntent(opts) {
    opts = opts || {};
    if (sessionStorage.getItem(LS_SEEN_EXIT)) return;
    if (!opts.magnet) return; // must be told what to offer — no generic fabricated offer

    var armed = false;
    setTimeout(function () { armed = true; }, 4000); // don't fire instantly on page load

    function show() {
      if (!armed || sessionStorage.getItem(LS_SEEN_EXIT)) return;
      sessionStorage.setItem(LS_SEEN_EXIT, '1');
      document.removeEventListener('mouseleave', onLeave);

      var overlay = document.createElement('div');
      overlay.id = 'apex-exit-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999998;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,sans-serif;';

      var card = document.createElement('div');
      card.style.cssText = 'background:#101014;border:1px solid #d4af37;border-radius:14px;padding:32px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.6);';
      card.innerHTML =
        '<div style="font-size:20px;font-weight:800;color:#d4af37;margin-bottom:8px;">Wait — before you go</div>' +
        '<div style="font-size:14px;color:#c8d0dc;margin-bottom:18px;">Get "' + opts.magnet + '" free — no charge, just enter your email.</div>';

      var input = document.createElement('input');
      input.type = 'email';
      input.placeholder = 'you@email.com';
      input.style.cssText = 'width:100%;padding:10px 12px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:14px;margin-bottom:10px;box-sizing:border-box;';

      var btn = document.createElement('button');
      btn.textContent = 'Send it to me';
      btn.style.cssText = 'width:100%;padding:11px;border-radius:8px;border:none;background:#d4af37;color:#0a0a0a;font-weight:700;font-size:14px;cursor:pointer;margin-bottom:10px;';

      var closeBtn = document.createElement('button');
      closeBtn.textContent = 'No thanks';
      closeBtn.style.cssText = 'width:100%;padding:8px;border-radius:8px;border:none;background:transparent;color:#888;font-size:12px;cursor:pointer;';
      closeBtn.onclick = function () { overlay.remove(); };

      btn.onclick = function () {
        if (captureLead(input.value.trim(), opts)) {
          card.innerHTML = '<div style="font-size:16px;color:#6ee7a0;font-weight:700;">✓ Check your inbox shortly.</div>';
          setTimeout(function () { overlay.remove(); }, 2200);
        } else {
          input.style.borderColor = '#e05c5c';
        }
      };

      card.appendChild(input);
      card.appendChild(btn);
      card.appendChild(closeBtn);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    function onLeave(e) {
      if (e.clientY <= 0) show();
    }

    document.addEventListener('mouseleave', onLeave);
  }

  // ─── 4. Social Share Buttons ────────────────────────────────────────────────
  // Opens each platform's own share dialog — no API keys needed for this part.

  function _shareURL(platform, url, text) {
    url = encodeURIComponent(url);
    text = encodeURIComponent(text || '');
    switch (platform) {
      case 'twitter':  return 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text;
      case 'linkedin': return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
      case 'facebook': return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
      default: return null;
    }
  }

  function wireShareButtons() {
    document.querySelectorAll('[data-apex-share]').forEach(function (btn) {
      if (btn._apexWired) return;
      btn._apexWired = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var platform = btn.getAttribute('data-apex-share');
        var url  = btn.getAttribute('data-apex-share-url') || location.href;
        var text = btn.getAttribute('data-apex-share-text') || document.title;
        var link = _shareURL(platform, url, text);
        if (link) {
          window.open(link, '_blank', 'noopener,noreferrer,width=600,height=500');
          trackEvent('share_click', { platform: platform });
        }
      });
    });
  }

  // ─── 5. Urgency / Scarcity Countdown Timer ─────────────────────────────────
  // Persists per-visitor in localStorage so refreshing the page doesn't reset it
  // (same honest pattern as the existing 24h trial countdowns elsewhere in the repo).

  function initUrgencyTimer(selector, opts) {
    opts = opts || {};
    var el = document.querySelector(selector);
    if (!el) return;

    var lsKey = 'apex_timer_' + (opts.id || selector);
    var durationMs = (opts.hours || 24) * 60 * 60 * 1000;
    var stored = _loadJSON(lsKey, null);
    var deadline;
    if (stored && stored.deadline && Date.now() < stored.deadline) {
      deadline = stored.deadline;
    } else {
      deadline = Date.now() + durationMs;
      _saveJSON(lsKey, { deadline: deadline });
    }

    function tick() {
      var remaining = deadline - Date.now();
      if (remaining <= 0) {
        el.textContent = opts.expiredText || 'Offer expired';
        clearInterval(interval);
        if (typeof opts.onExpire === 'function') opts.onExpire();
        return;
      }
      var h = Math.floor(remaining / 3600000);
      var m = Math.floor((remaining % 3600000) / 60000);
      var s = Math.floor((remaining % 60000) / 1000);
      el.textContent = (opts.prefix || '') + h + 'h ' + m + 'm ' + s + 's';
    }

    tick();
    var interval = setInterval(tick, 1000);
  }

  // ─── 5b. Sticky "Buy Now" Bar ───────────────────────────────────────────────
  // Appears after the visitor scrolls past a threshold, stays fixed at the
  // bottom. Dismissible — once dismissed it stays hidden for the rest of the
  // browser session (sessionStorage), so it never nags on every scroll tick.

  function initStickyBuyBar(opts) {
    opts = opts || {};
    if (!opts.href) return; // must be told where to send the click — no guessing
    if (sessionStorage.getItem('apex_stickybar_dismissed')) return;
    if (document.getElementById('apex-sticky-buy')) return;

    var threshold = opts.scrollPx || 400;
    var bar = null;

    function build() {
      bar = document.createElement('div');
      bar.id = 'apex-sticky-buy';
      bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:999997;' +
        'display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;' +
        'background:' + (opts.bg || '#101014') + ';border-top:1px solid ' + (opts.accent || '#d4af37') + ';' +
        'padding:12px 16px;font-family:system-ui,-apple-system,sans-serif;' +
        'transform:translateY(100%);transition:transform .25s ease;box-shadow:0 -8px 24px rgba(0,0,0,0.35);';

      var label = document.createElement('span');
      label.textContent = opts.text || 'Ready to get started?';
      label.style.cssText = 'color:#eee;font-size:14px;font-weight:600;';

      var cta = document.createElement('a');
      cta.href = opts.href;
      cta.textContent = opts.ctaText || 'Buy Now →';
      cta.target = opts.target || '_self';
      cta.rel = 'noopener';
      cta.style.cssText = 'display:inline-block;padding:9px 20px;border-radius:8px;' +
        'background:' + (opts.accent || '#d4af37') + ';color:#0a0a0a;font-weight:700;' +
        'font-size:14px;text-decoration:none;min-height:36px;line-height:1.3;';
      cta.addEventListener('click', function () { trackEvent('sticky_buy_click', { href: opts.href }); });

      var close = document.createElement('button');
      close.textContent = '×';
      close.setAttribute('aria-label', 'Dismiss');
      close.style.cssText = 'background:transparent;border:none;color:#888;font-size:20px;' +
        'cursor:pointer;line-height:1;padding:0 4px;';
      close.onclick = function () {
        sessionStorage.setItem('apex_stickybar_dismissed', '1');
        bar.style.transform = 'translateY(100%)';
        setTimeout(function () { bar.remove(); }, 250);
      };

      bar.appendChild(label);
      bar.appendChild(cta);
      bar.appendChild(close);
      document.body.appendChild(bar);
    }

    var shown = false;
    function onScroll() {
      if (shown) return;
      if (window.scrollY >= threshold) {
        shown = true;
        if (!bar) build();
        requestAnimationFrame(function () { bar.style.transform = 'translateY(0)'; });
        window.removeEventListener('scroll', onScroll);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─── 6. Honest Social Proof Widget ─────────────────────────────────────────
  // Rotates testimonials/counts YOU supply. Does NOT invent or auto-escalate
  // numbers — that would be a deceptive dark pattern.

  function initSocialProof(selector, items) {
    var el = document.querySelector(selector);
    if (!el || !items || !items.length) return;
    var i = 0;
    function render() {
      el.textContent = items[i % items.length];
      i++;
    }
    render();
    setInterval(render, 5000);
  }

  // ─── 7. Local Stats (per-browser only — see header note) ──────────────────

  function getLocalStats() {
    var events = _loadJSON(LS_EVENTS, []);
    var byName = {};
    events.forEach(function (e) {
      byName[e.name] = (byName[e.name] || 0) + 1;
    });
    return {
      totalEvents: events.length,
      byName: byName,
      lead: _loadJSON(LS_LEAD, null),
      note: 'Per-browser localStorage only — not real cross-visitor analytics. Wire window.supabase for real aggregate reporting.',
    };
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  window.Apex = {
    injectSEO: injectSEO,
    captureLead: captureLead,
    initExitIntent: initExitIntent,
    wireShareButtons: wireShareButtons,
    initUrgencyTimer: initUrgencyTimer,
    initStickyBuyBar: initStickyBuyBar,
    initSocialProof: initSocialProof,
    trackEvent: trackEvent,
    getLocalStats: getLocalStats,
  };

  function _autoInit() {
    trackEvent('page_view', {});
    wireShareButtons();

    // Re-wire share buttons if more get added dynamically later
    var observer = new MutationObserver(function () { wireShareButtons(); });
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _autoInit);
  } else {
    _autoInit();
  }

})();
