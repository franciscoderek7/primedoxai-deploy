/*
 * PrimeDox AI — Reusable Chat Widget
 * Embed on any empire site:
 *   <script src="/agents/agent-config.js"></script>
 *   <script src="/agents/chat-widget.js" data-agent="sentinel"></script>
 *
 * PAYPAL SWAP ZONE: Replace paypal.me links with PayPal Business links
 * when Derek creates them at paypal.com → Request → Create Payment Link
 */
(function() {
  const cfg = document.currentScript;
  const AGENT_ID   = (cfg && cfg.dataset.agent) || 'primedox';
  const SITE_LOOP  = (cfg && cfg.dataset.loop)  || 'A';

  const FREE_LIMIT = 5;
  const STORAGE_KEY = 'pd_chat_' + AGENT_ID;
  const HISTORY_KEY = 'pd_hist_' + AGENT_ID;

  function getAgent() {
    if (!window.PRIMEDOX_AGENTS) return null;
    return window.PRIMEDOX_AGENTS.agents.find(a => a.id === AGENT_ID) || window.PRIMEDOX_AGENTS.agents[0];
  }

  function getUsage() {
    const today = new Date().toDateString();
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (s.date !== today) return 0;
      return s.count || 0;
    } catch(e) { return 0; }
  }

  function incUsage() {
    const today = new Date().toDateString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: getUsage() + 1 }));
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function saveHistory(h) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-30))); }
    catch(e) {}
  }

  // ── Keyword-based offline response engine ──
  const OFFLINE_PATTERNS = [
    { re: /vpn|privacy|encrypt|anonymo|hide|ip address/i, key: 'vpn' },
    { re: /password|vault|credential|login|2fa|biometric/i, key: 'vault' },
    { re: /virus|malware|ransomware|hack|phish|threat|scan/i, key: 'threat' },
    { re: /audit|scan my site|security report|headers|ssl/i, key: 'audit' },
    { re: /cannabis|weed|marijuana|charge|criminal|cds|charter|court|arrest/i, key: 'cannabis' },
    { re: /document|affidavit|motion|claim|filing|template/i, key: 'document' },
    { re: /surveillance|stalker|spy|monitor|track me/i, key: 'surveillance' },
    { re: /pet|dog|cat|animal|gps collar|feeder/i, key: 'pet' },
    { re: /invest|partner|fund|equity|deal/i, key: 'invest' },
    { re: /schedule|calendar|meeting|time|productivity/i, key: 'schedule' },
    { re: /clean|cleaning|swarm|workforce/i, key: 'clean' },
    { re: /car|auto|vehicle|finance|fleet/i, key: 'auto' },
    { re: /hello|hi|hey|help|start|what can you do/i, key: 'hello' },
  ];

  const OFFLINE_RESPONSES = {
    vpn: {
      text: "I can help protect your online privacy with OmniaGuard's military-grade VPN. Zero logs, 40+ countries, 256-bit AES encryption. One tap and you're invisible.",
    },
    vault: {
      text: "I'll secure your passwords and sensitive data with OmniaGuard's AES-256-GCM encrypted vault. Biometric unlock, local storage only — we never see your data.",
    },
    threat: {
      text: "Threat analysis initiated. OmniaGuard's AI antivirus engine detects zero-day threats in real time — before signature databases even know they exist.",
    },
    audit: {
      text: "I can run a full security audit of your website — SSL, security headers, exposed files, and software vulnerabilities. Full PDF report with remediation plan.",
    },
    cannabis: {
      text: "Charter rights analysis available. Counsel at BENO-X has helped hundreds of Canadians understand their constitutional protections. Note: This is educational, not legal advice.",
    },
    document: {
      text: "I can generate educational court document templates — Statement of Claim, Affidavit, Motion, Demand Letter. Fill in your details, download your template. Review with a licensed lawyer before filing.",
    },
    surveillance: {
      text: "VIGILAX counter-surveillance assessment available. If you're concerned about being monitored — by a stalker, competitor, or state actor — VIGILAX provides professional counter-surveillance intelligence.",
    },
    pet: {
      text: "I recommend the right TechPetCage smart device for your pet's needs. GPS trackers, health monitors, smart feeders, and cameras — all app-controlled.",
    },
    invest: {
      text: "Phoenix is standing by for dynasty-level strategy. Francisco Holdings Inc. manages 45+ companies across security, legal, AI, and specialized sectors. What investment opportunity are you exploring?",
    },
    schedule: {
      text: "Chronos can optimize your schedule. Kiaros AI identifies meeting overload, protects focus time, and integrates with Google Calendar, Outlook, and Teams.",
    },
    clean: {
      text: "CleanSwarm automates your cleaning operations — dispatch, quality tracking, client management, and analytics. Clients typically see 25% less admin time in the first month.",
    },
    auto: {
      text: "Torque at Vault Velocity Auto can analyze your vehicle financing, run diagnostics, and optimize your auto strategy. What's your vehicle question?",
    },
    hello: {
      text: "Hello! I'm ready to help. Tell me what you need — security protection, legal education, pet tech, business strategy, or anything else.",
    },
  };

  function offlineResponse(agent, userMsg) {
    let matched = null;
    for (const p of OFFLINE_PATTERNS) {
      if (p.re.test(userMsg)) { matched = p.key; break; }
    }

    const base = matched ? OFFLINE_RESPONSES[matched] : {
      text: "I can help with that. Tell me more about what you're looking for and I'll connect you with the right resource or specialist.",
    };

    return { text: base.text, revenue: agent.revenue || [] };
  }

  async function callAPI(agent, messages) {
    const endpoint = window.PRIMEDOX_API_URL;
    if (!endpoint) return null;
    try {
      const r = await fetch(endpoint + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agent.id, messages, thread_id: sessionStorage.getItem('pd_thread_' + agent.id) }),
      });
      if (!r.ok) return null;
      const d = await r.json();
      if (d.thread_id) sessionStorage.setItem('pd_thread_' + agent.id, d.thread_id);
      return d.response;
    } catch(e) { return null; }
  }

  function buildRevenueHTML(revenue) {
    if (!revenue || !revenue.length) return '';
    let h = '<div class="pd-revenue">';
    revenue.forEach(function(r, i) {
      const cls = r.primary ? 'pd-btn-primary' : 'pd-btn-secondary';
      h += '<a href="' + r.url + '" target="_blank" rel="noopener" class="pd-revenue-btn ' + cls + '">' + r.label + '</a>';
    });
    h += '<div class="pd-disclaimer">Secure via PayPal · No account required · Educational content only</div></div>';
    return h;
  }

  function buildUpgradeHTML(agent) {
    const p = (window.PRIMEDOX_AGENTS || {}).pricing || {};
    return '<div class="pd-revenue">' +
      '<div style="font-size:12px;color:#D4AF37;font-weight:700;margin-bottom:8px;">🚀 Upgrade for Unlimited Access</div>' +
      (p.starter ? '<a href="' + p.starter.paypal + '" target="_blank" class="pd-revenue-btn pd-btn-primary">💳 ' + p.starter.label + '</a>' : '') +
      (p.professional ? '<a href="' + p.professional.paypal + '" target="_blank" class="pd-revenue-btn pd-btn-secondary">⭐ ' + p.professional.label + '</a>' : '') +
      '<div class="pd-disclaimer">Unlimited messages · All 45 agents · Priority response</div></div>';
  }

  function injectStyles() {
    if (document.getElementById('pd-widget-styles')) return;
    const s = document.createElement('style');
    s.id = 'pd-widget-styles';
    s.textContent = `
      #pd-bubble{position:fixed;bottom:24px;right:24px;width:52px;height:52px;background:linear-gradient(135deg,#10B981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;box-shadow:0 4px 24px rgba(16,185,129,0.5);z-index:9000;transition:transform 0.2s;}
      #pd-bubble:hover{transform:scale(1.08);}
      #pd-bubble .pd-notif{position:absolute;top:-3px;right:-3px;background:#D4AF37;color:#111;font-size:9px;font-weight:900;width:17px;height:17px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
      #pd-panel{position:fixed;bottom:88px;right:24px;width:340px;max-height:560px;background:#0d0d14;border:1px solid rgba(212,175,55,0.3);border-radius:16px;box-shadow:0 16px 64px rgba(0,0,0,0.7);z-index:9001;display:none;flex-direction:column;overflow:hidden;}
      @media(max-width:480px){#pd-panel{width:calc(100vw - 16px);bottom:0;right:0;max-height:100dvh;border-radius:16px 16px 0 0;}}
      .pd-head{background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(212,175,55,0.08));border-bottom:1px solid rgba(212,175,55,0.15);padding:14px 16px;display:flex;align-items:center;gap:10px;}
      .pd-avatar{width:36px;height:36px;background:linear-gradient(135deg,#10B981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
      .pd-agent-info{flex:1;}
      .pd-agent-name{font-size:14px;font-weight:800;color:#fff;}
      .pd-agent-role{font-size:11px;color:#888;}
      .pd-close{background:none;border:none;color:#666;font-size:18px;cursor:pointer;padding:4px;}
      .pd-close:hover{color:#fff;}
      .pd-messages{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;min-height:0;}
      .pd-msg{max-width:85%;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.5;}
      .pd-msg.bot{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);align-self:flex-start;color:#e8e8e8;}
      .pd-msg.user{background:linear-gradient(135deg,#10B981,#059669);color:#fff;align-self:flex-end;border-radius:12px 12px 4px 12px;}
      .pd-typing{align-self:flex-start;color:#555;font-size:12px;padding:8px 12px;}
      .pd-revenue{background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.15);border-radius:8px;padding:10px;margin-top:8px;}
      .pd-revenue-btn{display:block;padding:9px 12px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700;text-align:center;margin-bottom:6px;transition:opacity 0.15s;}
      .pd-revenue-btn:last-child{margin-bottom:0;}
      .pd-btn-primary{background:#F59E0B;color:#111;}
      .pd-btn-primary:hover{background:#D97706;}
      .pd-btn-secondary{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.8);}
      .pd-btn-secondary:hover{border-color:rgba(212,175,55,0.4);color:#D4AF37;}
      .pd-disclaimer{font-size:10px;color:#555;text-align:center;margin-top:6px;}
      .pd-footer{border-top:1px solid rgba(255,255,255,0.06);padding:10px 12px;display:flex;gap:8px;flex-shrink:0;}
      .pd-input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#fff;font-size:13px;outline:none;resize:none;}
      .pd-input:focus{border-color:rgba(212,175,55,0.4);}
      .pd-send{background:#10B981;border:none;color:#fff;border-radius:8px;width:38px;flex-shrink:0;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;}
      .pd-send:hover{background:#059669;}
      .pd-escalate{display:block;text-align:center;font-size:11px;color:#555;padding:6px 12px;text-decoration:none;border-top:1px solid rgba(255,255,255,0.04);}
      .pd-escalate:hover{color:#D4AF37;}
      .pd-usage{font-size:10px;color:#555;text-align:center;padding:4px 12px;}
    `;
    document.head.appendChild(s);
  }

  function buildPanel(agent) {
    const panel = document.createElement('div');
    panel.id = 'pd-panel';
    panel.innerHTML = `
      <div class="pd-head">
        <div class="pd-avatar">${agent.avatar}</div>
        <div class="pd-agent-info">
          <div class="pd-agent-name">${agent.name}</div>
          <div class="pd-agent-role">${agent.role}</div>
        </div>
        <button class="pd-close" onclick="document.getElementById('pd-panel').style.display='none'">✕</button>
      </div>
      <div class="pd-messages" id="pd-messages"></div>
      <div class="pd-usage" id="pd-usage"></div>
      <div class="pd-footer">
        <textarea class="pd-input" id="pd-input" placeholder="Ask ${agent.name}..." rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window.pdSend();}"></textarea>
        <button class="pd-send" onclick="window.pdSend()">↑</button>
      </div>
      <a class="pd-escalate" href="mailto:${agent.loop === 'B' ? 'omniaguard1@gmail.com' : 'franciscoderek7@gmail.com'}?subject=Escalate+to+Human+from+${encodeURIComponent(agent.name)}" target="_blank">↗ Escalate to Human Expert</a>
      <div style="text-align:center;font-size:10px;color:#333;padding:4px 0 6px;">Powered by PrimeDox AI · Francisco Holdings Inc.</div>
    `;
    return panel;
  }

  function addMessage(type, html) {
    const msgs = document.getElementById('pd-messages');
    if (!msgs) return;
    const el = document.createElement('div');
    el.className = 'pd-msg ' + type;
    el.innerHTML = html;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('pd-messages');
    if (!msgs) return;
    const el = document.createElement('div');
    el.className = 'pd-typing';
    el.id = 'pd-typing';
    el.textContent = '• • •';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('pd-typing');
    if (t) t.remove();
  }

  function updateUsageDisplay(agent) {
    const el = document.getElementById('pd-usage');
    if (!el) return;
    const used = getUsage();
    if (used >= FREE_LIMIT) {
      el.textContent = 'Daily limit reached (5/5) — upgrade for unlimited access';
      el.style.color = '#D4AF37';
    } else {
      el.textContent = (FREE_LIMIT - used) + ' free messages remaining today';
    }
  }

  window.pdSend = async function() {
    const agent = getAgent();
    if (!agent) return;
    const input = document.getElementById('pd-input');
    const msg = (input.value || '').trim();
    if (!msg) return;

    const usage = getUsage();
    if (usage >= FREE_LIMIT) {
      addMessage('bot', 'You\'ve used your 5 free messages today.<br>' + buildUpgradeHTML(agent));
      return;
    }

    input.value = '';
    input.style.height = 'auto';
    addMessage('user', msg.replace(/</g,'&lt;').replace(/>/g,'&gt;'));
    incUsage();
    updateUsageDisplay(agent);

    const history = getHistory();
    history.push({ role: 'user', content: msg });

    showTyping();

    let responseText, revenueItems;
    const apiResp = await callAPI(agent, history);
    if (apiResp) {
      responseText = apiResp;
      revenueItems = agent.revenue;
    } else {
      const offline = offlineResponse(agent, msg);
      responseText = offline.text;
      revenueItems = offline.revenue;
    }

    removeTyping();
    history.push({ role: 'assistant', content: responseText });
    saveHistory(history);

    addMessage('bot', responseText.replace(/</g,'&lt;').replace(/>/g,'&gt;') + buildRevenueHTML(revenueItems));
  };

  function init() {
    const agent = getAgent();
    if (!agent) { console.warn('PrimeDox Widget: agent not found:', AGENT_ID); return; }

    injectStyles();

    // Bubble
    const bubble = document.createElement('div');
    bubble.id = 'pd-bubble';
    bubble.title = 'Chat with ' + agent.name;
    bubble.innerHTML = agent.avatar + '<span class="pd-notif">AI</span>';
    bubble.onclick = function() {
      const panel = document.getElementById('pd-panel');
      const showing = panel.style.display === 'flex';
      panel.style.display = showing ? 'none' : 'flex';
      if (!showing) {
        const msgs = document.getElementById('pd-messages');
        const history = getHistory();
        if (msgs && !msgs.children.length) {
          if (history.length) {
            history.forEach(function(m) {
              addMessage(m.role === 'user' ? 'user' : 'bot', (m.content || '').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
            });
          } else {
            addMessage('bot', agent.greeting + buildRevenueHTML(agent.revenue));
          }
          updateUsageDisplay(agent);
        }
      }
    };

    const panel = buildPanel(agent);
    document.body.appendChild(bubble);
    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
