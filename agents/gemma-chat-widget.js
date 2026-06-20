// gemma-chat-widget.js — Floating chat widget backed by gemma3:27b (or GPT-4o
// in hybrid mode) via agents/backend/gemma-server.js's existing /chat route.
// CDN: https://cdn.jsdelivr.net/gh/franciscoderek7/primedoxai-deploy@main/agents/gemma-chat-widget.js
//
// Same backend, same security model as agents/chinese-ai-connector.js: the
// model key/endpoint lives server-side in agents/backend/ (.env), never in
// this browser file. This widget just calls window.PRIMEDOX_BACKEND_URL + '/chat'
// with { agent_id, messages, session_id } — the exact shape /chat already expects
// (see gemma-server.js). No new backend route needed.
//
// SETUP REQUIRED — same as chinese-ai-connector.js:
//   1. Deploy agents/backend/ (Railway/Render/Fly.io)
//   2. Set window.PRIMEDOX_BACKEND_URL on the page BEFORE this script loads
// Until that's done, the widget renders but every send attempt shows an honest
// "not configured" message instead of a fake reply.

(function () {
  'use strict';

  var LS_SESSION = 'gemma_chat_session_id';

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

  function _send(agentId, message) {
    var base = _backendURL();
    if (!base) {
      return Promise.resolve({
        ok: false,
        error: 'AI chat backend not configured yet. Set window.PRIMEDOX_BACKEND_URL once agents/backend/ is deployed.',
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
      .catch(function (err) { return { ok: false, error: 'Network error reaching AI backend: ' + err.message }; });
  }

  function init(opts) {
    opts = opts || {};
    var agentId = opts.agentId || 'primedox';
    var accent = opts.accent || '#d4af37';
    var greeting = opts.greeting || 'Hi — ask me anything about this site.';

    if (document.getElementById('gemma-chat-bubble')) return; // already mounted

    var bubble = document.createElement('button');
    bubble.id = 'gemma-chat-bubble';
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.textContent = '💬';
    bubble.style.cssText = 'position:fixed;bottom:20px;right:20px;width:52px;height:52px;' +
      'border-radius:50%;border:none;background:' + accent + ';color:#0a0a0a;font-size:22px;' +
      'cursor:pointer;z-index:999996;box-shadow:0 6px 20px rgba(0,0,0,0.35);';

    var panel = document.createElement('div');
    panel.id = 'gemma-chat-panel';
    panel.style.cssText = 'position:fixed;bottom:84px;right:20px;width:320px;max-height:440px;' +
      'background:#101014;border:1px solid ' + accent + ';border-radius:12px;z-index:999996;' +
      'display:none;flex-direction:column;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;' +
      'box-shadow:0 12px 36px rgba(0,0,0,0.5);';

    var log = document.createElement('div');
    log.style.cssText = 'flex:1;overflow-y:auto;padding:14px;font-size:13px;color:#ddd;line-height:1.5;max-height:320px;';

    function addMsg(text, who) {
      var row = document.createElement('div');
      row.style.cssText = 'margin-bottom:10px;text-align:' + (who === 'user' ? 'right' : 'left') + ';';
      var bub = document.createElement('span');
      bub.style.cssText = 'display:inline-block;padding:8px 11px;border-radius:8px;max-width:85%;' +
        (who === 'user'
          ? 'background:' + accent + ';color:#0a0a0a;'
          : 'background:#1c1c22;color:#eee;');
      bub.textContent = text;
      row.appendChild(bub);
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
    }

    var inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;border-top:1px solid #2a2a2a;';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a message…';
    input.style.cssText = 'flex:1;padding:10px;border:none;background:#0d0d0f;color:#fff;font-size:13px;outline:none;';

    var send = document.createElement('button');
    send.textContent = 'Send';
    send.style.cssText = 'padding:10px 14px;border:none;background:' + accent + ';color:#0a0a0a;font-weight:700;font-size:13px;cursor:pointer;';

    function doSend() {
      var text = input.value.trim();
      if (!text) return;
      addMsg(text, 'user');
      input.value = '';
      addMsg('…', 'bot');
      var thinking = log.lastChild;
      _send(agentId, text).then(function (res) {
        thinking.remove();
        if (res.ok && res.data && res.data.response) {
          addMsg(res.data.response, 'bot');
        } else {
          addMsg((res.data && res.data.error) || res.error || 'AI backend not reachable right now.', 'bot');
        }
      });
    }

    send.onclick = doSend;
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSend(); });

    inputRow.appendChild(input);
    inputRow.appendChild(send);
    panel.appendChild(log);
    panel.appendChild(inputRow);

    var opened = false;
    bubble.onclick = function () {
      opened = !opened;
      panel.style.display = opened ? 'flex' : 'none';
      if (opened && !log.firstChild) addMsg(greeting, 'bot');
    };

    document.body.appendChild(bubble);
    document.body.appendChild(panel);
  }

  window.GemmaChat = { init: init };

})();
