// chinese-ai-connector.js — Client-side bridge to the Chinese AI backend
// CDN: https://cdn.jsdelivr.net/gh/franciscoderek7/primedoxai-deploy@main/agents/chinese-ai-connector.js
//
// IMPORTANT — WHY THIS FILE DOES NOT CALL DEEPSEEK/QWEN/GLM/KIMI DIRECTLY:
// Every vendor API requires a secret key in the request header. This file is
// loaded as a public <script> on live websites — anything in it is visible to
// every visitor via "view source." Putting a real DeepSeek/Qwen/GLM/Kimi key
// here would leak it to the entire internet within minutes. Instead, this file
// calls YOUR OWN backend server (agents/backend/gemma-server.js, extended with
// /generate-motion, /translate, /suggest-fix routes) — that server holds the
// real keys in its .env file, server-side, never shipped to the browser.
//
// SETUP REQUIRED BEFORE THIS DOES ANYTHING:
//   1. Deploy agents/backend/ (Railway/Render/Fly.io — see that folder's comments)
//   2. Fill in DEEPSEEK_API_KEY / QWEN_API_KEY / GLM_API_KEY / KIMI_API_KEY in its .env
//   3. Set window.PRIMEDOX_BACKEND_URL on the page BEFORE this script loads, e.g.:
//      <script>window.PRIMEDOX_BACKEND_URL = 'https://your-backend.up.railway.app';</script>
// Until that's done, every call below returns an honest "not configured" result
// instead of fabricating a response — same placeholder convention as
// agents/payment-provider.js (STRIPE_PRICE_IDS) and the Formspree YOUR_FORM_ID pattern.

(function () {
  'use strict';

  var LS_USAGE = 'apex_chinese_ai_usage'; // per-browser usage counter (cost-control v1)

  function _backendURL() {
    return (window.PRIMEDOX_BACKEND_URL || '').replace(/\/$/, '');
  }

  function _trackUsage(feature) {
    try {
      var raw = localStorage.getItem(LS_USAGE);
      var data = raw ? JSON.parse(raw) : {};
      data[feature] = (data[feature] || 0) + 1;
      data._lastUsed = Date.now();
      localStorage.setItem(LS_USAGE, JSON.stringify(data));
      if (window.Apex && typeof window.Apex.trackEvent === 'function') {
        window.Apex.trackEvent('chinese_ai_call', { feature: feature, site: location.hostname });
      }
    } catch (e) {}
  }

  function _post(path, body) {
    var base = _backendURL();
    if (!base) {
      return Promise.resolve({
        ok: false,
        error: 'AI backend not configured yet. Set window.PRIMEDOX_BACKEND_URL once agents/backend/ is deployed and the relevant API key is added to its .env.',
      });
    }
    return fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, data: j }; }); })
      .catch(function (err) { return { ok: false, error: 'Network error reaching AI backend: ' + err.message }; });
  }

  // ─── Feature: Generate Motion (DeepSeek-first, via /generate-motion) ───────
  function generateMotion(motionType, facts, jurisdiction) {
    _trackUsage('generate-motion');
    return _post('/generate-motion', { motionType: motionType, facts: facts, jurisdiction: jurisdiction });
  }

  // ─── Feature: Translate (Qwen-first, via /translate) ──────────────────────
  function translate(text, targetLang) {
    _trackUsage('translate');
    return _post('/translate', { text: text, targetLang: targetLang });
  }

  // ─── Feature: Suggest Fix (GLM-first, via /suggest-fix) — SUGGESTIONS ONLY,
  // never auto-applied to any file. ─────────────────────────────────────────
  function suggestFix(context, description) {
    _trackUsage('suggest-fix');
    return _post('/suggest-fix', { context: context, description: description });
  }

  // ─── Reusable Language Selector Widget ─────────────────────────────────────
  // Wires a <select> of language codes to call translate() on every text node
  // inside a target container. Honest about being a basic MVP: it translates
  // the container's current textContent snapshot, not a live DOM diff/reflow
  // system — good enough for a single page section, not a full SPA i18n engine.
  function initLanguageSelector(selectEl, containerEl, opts) {
    opts = opts || {};
    if (!selectEl || !containerEl) return;
    var original = containerEl.innerHTML;

    selectEl.addEventListener('change', function () {
      var lang = selectEl.value;
      if (!lang || lang === 'en') {
        containerEl.innerHTML = original;
        return;
      }
      var loadingMsg = opts.loadingText || 'Translating…';
      var prevHTML = containerEl.innerHTML;
      containerEl.style.opacity = '0.5';
      translate(containerEl.innerText, lang).then(function (res) {
        containerEl.style.opacity = '1';
        if (res.ok && res.data && res.data.text) {
          containerEl.innerText = res.data.text;
        } else {
          containerEl.innerHTML = prevHTML;
          if (typeof opts.onError === 'function') {
            opts.onError(res.error || (res.data && res.data.error) || 'Translation unavailable');
          }
        }
      });
    });
  }

  window.ChineseAI = {
    generateMotion: generateMotion,
    translate: translate,
    suggestFix: suggestFix,
    initLanguageSelector: initLanguageSelector,
    getUsage: function () {
      try { return JSON.parse(localStorage.getItem(LS_USAGE) || '{}'); } catch (e) { return {}; }
    },
  };

})();
