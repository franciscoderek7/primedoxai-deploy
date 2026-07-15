// gemma-chat-widget.js v2 — Timmy Chat Widget
// Floating bottom-right widget with close, minimize, localStorage state,
// desktop drag, mobile full-screen + swipe-to-minimize.
// CDN: https://cdn.jsdelivr.net/gh/franciscoderek7/primedoxai-deploy@main/agents/gemma-chat-widget.js
//
// BACKEND: set window.PRIMEDOX_BACKEND_URL before this script loads.
// Without it the widget renders but replies with a "not configured" message.

(function () {
  'use strict';

  var LS_SESSION  = 'gemma_chat_session_id';
  var LS_STATE    = 'timmy_chat_open_v2';
  var SEND_COLOR  = '#00d084'; // emerald — fixed per brand spec
  var MOBILE_BP   = 768;

  // ── Backend ────────────────────────────────────────────────────────────────
  function _backendURL() {
    return (window.PRIMEDOX_BACKEND_URL || '').replace(/\/$/, '');
  }

  function _sessionId() {
    try {
      var id = localStorage.getItem(LS_SESSION);
      if (!id) {
        id = 'web_' + Math.random().toString(36).slice(2) + Date.now();
        localStorage.setItem(LS_SESSION, id);
      }
      return id;
    } catch (e) { return 'web_' + Date.now(); }
  }

  function _sendToBackend(agentId, message) {
    var base = _backendURL();
    if (!base) {
      return Promise.resolve({
        ok: false,
        error: 'AI backend not configured yet. Deploy agents/backend/ and set window.PRIMEDOX_BACKEND_URL.',
      });
    }
    return fetch(base + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: agentId,
        messages: [{ role: 'user', content: message }],
        session_id: _sessionId(),
      }),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, data: j }; }); })
      .catch(function (err) { return { ok: false, error: 'Network error: ' + err.message }; });
  }

  function _isMobile() { return window.innerWidth < MOBILE_BP; }

  // ── Main init ──────────────────────────────────────────────────────────────
  function init(opts) {
    opts = opts || {};
    var agentId  = opts.agentId  || 'primedox';
    var accent   = opts.accent   || '#d4af37';
    var name     = opts.name     || 'Timmy';
    var greeting = opts.greeting || 'Hi — ask me anything about this site.';

    if (document.getElementById('timmy-chat-bubble')) return;

    // ── Global styles ──────────────────────────────────────────────────────
    var styleEl = document.createElement('style');
    styleEl.textContent = [
      '@keyframes timmy-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
      '#timmy-chat-log::-webkit-scrollbar{width:4px}',
      '#timmy-chat-log::-webkit-scrollbar-thumb{background:#333;border-radius:2px}',
      '#timmy-chat-log::-webkit-scrollbar-track{background:transparent}',
      '#timmy-send-btn:active{background:#009960!important}',
      '@media(max-width:' + MOBILE_BP + 'px){',
        '#timmy-chat-panel{position:fixed!important;top:0!important;left:0!important;right:0!important;',
          'bottom:0!important;width:auto!important;max-height:none!important;',
          'border-radius:0!important;border:none!important;box-shadow:none!important;}',
        '#timmy-chat-overlay{display:none!important;}',
      '}',
    ].join('');
    document.head.appendChild(styleEl);

    // ── Overlay (desktop: semi-transparent backdrop) ───────────────────────
    var overlay = document.createElement('div');
    overlay.id = 'timmy-chat-overlay';
    overlay.style.cssText = [
      'display:none;position:fixed;inset:0;',
      'background:rgba(0,0,0,0.45);',
      'z-index:999994;',
      'backdrop-filter:blur(2px);',
    ].join('');

    // ── Panel ─────────────────────────────────────────────────────────────
    var panel = document.createElement('div');
    panel.id = 'timmy-chat-panel';
    panel.style.cssText = [
      'position:fixed;bottom:84px;right:20px;',
      'width:350px;max-height:500px;',
      'background:#101014;',
      'border:1px solid ' + accent + ';',
      'border-radius:14px;',
      'z-index:999996;',
      'display:none;flex-direction:column;',
      'overflow:hidden;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'box-shadow:0 16px 48px rgba(0,0,0,0.6);',
    ].join('');

    // ── Header ────────────────────────────────────────────────────────────
    var header = document.createElement('div');
    header.id = 'timmy-chat-header';
    header.style.cssText = [
      'display:flex;align-items:center;',
      'background:#18181b;',
      'border-bottom:1px solid #2a2a2a;',
      'padding:0 8px 0 14px;',
      'min-height:48px;flex-shrink:0;',
      'cursor:grab;user-select:none;-webkit-user-select:none;',
    ].join('');

    var hIcon = document.createElement('span');
    hIcon.textContent = '🤖';
    hIcon.style.cssText = 'font-size:17px;margin-right:8px;flex-shrink:0;';

    var hName = document.createElement('span');
    hName.textContent = name;
    hName.style.cssText = 'font-weight:700;font-size:14px;color:#fff;flex:1;';

    var hDot = document.createElement('span');
    hDot.style.cssText = [
      'width:7px;height:7px;border-radius:50%;',
      'background:#00d084;display:inline-block;',
      'margin-right:10px;flex-shrink:0;',
      'animation:timmy-pulse 2s infinite;',
    ].join('');

    function _hBtn(title, html) {
      var b = document.createElement('button');
      b.title = title;
      b.innerHTML = html;
      b.style.cssText = [
        'background:none;border:none;',
        'color:#777;cursor:pointer;',
        'font-size:16px;font-weight:700;',
        'min-width:36px;min-height:48px;',
        'padding:0;line-height:1;',
        'transition:color .15s;',
      ].join('');
      return b;
    }

    var minBtn   = _hBtn('Minimize', '&#8722;');
    var closeBtn = _hBtn('Close', '&#10005;');
    minBtn.onmouseover   = function() { this.style.color = '#fff'; };
    minBtn.onmouseout    = function() { this.style.color = '#777'; };
    closeBtn.onmouseover = function() { this.style.color = '#ff4444'; };
    closeBtn.onmouseout  = function() { this.style.color = '#777'; };

    header.appendChild(hIcon);
    header.appendChild(hName);
    header.appendChild(hDot);
    header.appendChild(minBtn);
    header.appendChild(closeBtn);

    // ── Message log ────────────────────────────────────────────────────────
    var log = document.createElement('div');
    log.id = 'timmy-chat-log';
    log.style.cssText = [
      'flex:1;overflow-y:auto;',
      'padding:14px;',
      'font-size:13px;color:#ddd;line-height:1.6;',
    ].join('');

    function addMsg(text, who) {
      var row = document.createElement('div');
      row.style.cssText = 'margin-bottom:12px;text-align:' + (who === 'user' ? 'right' : 'left') + ';';
      var bub = document.createElement('span');
      bub.style.cssText = [
        'display:inline-block;padding:9px 13px;',
        'border-radius:10px;max-width:86%;',
        'word-wrap:break-word;word-break:break-word;',
        'font-size:13px;line-height:1.5;',
        who === 'user'
          ? 'background:' + accent + ';color:#000;'
          : 'background:#1f1f27;color:#eee;border:1px solid #2d2d35;',
      ].join('');
      bub.textContent = text;
      row.appendChild(bub);
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
    }

    // ── Input row ─────────────────────────────────────────────────────────
    var inputRow = document.createElement('div');
    inputRow.style.cssText = [
      'display:flex;flex-shrink:0;',
      'border-top:1px solid #2a2a2a;',
      'min-height:52px;',
    ].join('');

    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'timmy-chat-input';
    input.placeholder = 'Ask ' + name + '…';
    input.autocomplete = 'off';
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'sentences');
    input.style.cssText = [
      'flex:1;padding:0 14px;',
      'border:none;outline:none;',
      'background:#0d0d0f;color:#fff;',
      'font-size:14px;',
    ].join('');

    var sendBtn = document.createElement('button');
    sendBtn.id = 'timmy-send-btn';
    sendBtn.title = 'Send message (Enter)';
    sendBtn.innerHTML = '<span style="font-size:20px;line-height:1;display:block;">&#9992;</span>';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.style.cssText = [
      'min-width:52px;min-height:52px;',
      'border:none;cursor:pointer;',
      'background:' + SEND_COLOR + ';color:#000;',
      'flex-shrink:0;',
      'display:flex;align-items:center;justify-content:center;',
      'transition:background .15s;',
      '-webkit-tap-highlight-color:transparent;',
    ].join('');
    sendBtn.onmouseover = function() { this.style.background = '#009960'; };
    sendBtn.onmouseout  = function() { this.style.background = SEND_COLOR; };

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    // ── Bubble ────────────────────────────────────────────────────────────
    var bubble = document.createElement('button');
    bubble.id = 'timmy-chat-bubble';
    bubble.setAttribute('aria-label', 'Open ' + name + ' chat');
    bubble.innerHTML = '🤖&thinsp;<span style="font-size:13px;font-weight:700;letter-spacing:.3px;">' + name + '</span>';
    bubble.style.cssText = [
      'position:fixed;bottom:20px;right:20px;',
      'min-height:48px;padding:0 18px;',
      'border-radius:24px;border:none;',
      'background:' + accent + ';color:#000;',
      'font-size:16px;',
      'cursor:pointer;z-index:999997;',
      'box-shadow:0 6px 24px rgba(0,0,0,0.4);',
      'display:flex;align-items:center;gap:6px;',
      'font-family:system-ui,-apple-system,sans-serif;',
      'transition:transform .15s,box-shadow .15s;',
      '-webkit-tap-highlight-color:transparent;',
    ].join('');
    bubble.onmouseover = function() { this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 32px rgba(0,0,0,0.5)'; };
    bubble.onmouseout  = function() { this.style.transform='';                  this.style.boxShadow='0 6px 24px rgba(0,0,0,0.4)'; };

    // ── Assemble panel ────────────────────────────────────────────────────
    panel.appendChild(header);
    panel.appendChild(log);
    panel.appendChild(inputRow);

    // ── State ─────────────────────────────────────────────────────────────
    var isOpen = false;
    var greetingShown = false;

    function _saveState(v) { try { localStorage.setItem(LS_STATE, v ? '1' : '0'); } catch(e) {} }
    function _loadState() { try { return localStorage.getItem(LS_STATE); } catch(e) { return null; } }

    function openPanel() {
      isOpen = true;
      _saveState(true);
      panel.style.display = 'flex';
      bubble.style.display = 'none';
      if (!_isMobile()) overlay.style.display = 'block';
      if (!greetingShown) { addMsg(greeting, 'bot'); greetingShown = true; }
      setTimeout(function() {
        try { input.focus(); } catch(e) {}
      }, 150);
    }

    function closePanel() {
      isOpen = false;
      _saveState(false);
      panel.style.display = 'none';
      overlay.style.display = 'none';
      bubble.style.display = 'flex';
    }

    // ── Send ──────────────────────────────────────────────────────────────
    function doSend() {
      var text = input.value.trim();
      if (!text) return;
      addMsg(text, 'user');
      input.value = '';
      var thinkRow = document.createElement('div');
      thinkRow.style.cssText = 'margin-bottom:12px;text-align:left;';
      var thinkBub = document.createElement('span');
      thinkBub.style.cssText = 'display:inline-block;padding:9px 13px;border-radius:10px;background:#1f1f27;color:#888;border:1px solid #2d2d35;font-size:13px;';
      thinkBub.textContent = '…';
      thinkRow.appendChild(thinkBub);
      log.appendChild(thinkRow);
      log.scrollTop = log.scrollHeight;
      _sendToBackend(agentId, text).then(function (res) {
        if (thinkRow.parentNode) thinkRow.parentNode.removeChild(thinkRow);
        if (res.ok && res.data && res.data.response) {
          addMsg(res.data.response, 'bot');
        } else {
          addMsg((res.data && res.data.error) || res.error || 'AI backend not reachable right now.', 'bot');
        }
      });
    }

    sendBtn.addEventListener('click', doSend);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });

    // ── Close / minimize ──────────────────────────────────────────────────
    closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closePanel(); });
    minBtn.addEventListener('click',   function(e) { e.stopPropagation(); closePanel(); });
    bubble.addEventListener('click',   openPanel);
    overlay.addEventListener('click',  closePanel);

    // ── Desktop drag ──────────────────────────────────────────────────────
    var dragging = false, dragX0, dragY0, panelLeft0, panelTop0;

    header.addEventListener('mousedown', function(e) {
      if (_isMobile() || e.target === minBtn || e.target === closeBtn) return;
      dragging = true;
      header.style.cursor = 'grabbing';
      dragX0 = e.clientX;
      dragY0 = e.clientY;
      var rect = panel.getBoundingClientRect();
      panelLeft0 = rect.left;
      panelTop0  = rect.top;
      panel.style.right  = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left   = panelLeft0 + 'px';
      panel.style.top    = panelTop0  + 'px';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      var nx = Math.max(0, Math.min(panelLeft0 + e.clientX - dragX0, window.innerWidth  - panel.offsetWidth));
      var ny = Math.max(0, Math.min(panelTop0  + e.clientY - dragY0, window.innerHeight - panel.offsetHeight));
      panel.style.left = nx + 'px';
      panel.style.top  = ny + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (!dragging) return;
      dragging = false;
      header.style.cursor = 'grab';
    });

    // ── Mobile: swipe header down to close ────────────────────────────────
    var touchY0 = 0;
    header.addEventListener('touchstart', function(e) {
      touchY0 = e.touches[0].clientY;
    }, { passive: true });
    header.addEventListener('touchend', function(e) {
      if (e.changedTouches[0].clientY - touchY0 > 60) closePanel();
    }, { passive: true });

    // ── Resize ────────────────────────────────────────────────────────────
    window.addEventListener('resize', function() {
      if (isOpen && !_isMobile()) overlay.style.display = 'block';
      if (isOpen && _isMobile())  overlay.style.display = 'none';
    });

    // ── Mount ─────────────────────────────────────────────────────────────
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(bubble);

    // ── Restore open state ────────────────────────────────────────────────
    if (_loadState() === '1') openPanel();
  }

  window.GemmaChat = { init: init };

})();
