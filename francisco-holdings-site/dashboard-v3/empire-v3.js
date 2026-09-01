/* Empire Command Center v3 — Core UI Logic */
(function () {
  'use strict';

  /* ── EMPIRE DATA ── */
  var FLOORS = [
    { floor: 'B', name: 'Francisco Holdings Inc.', domain: 'franciscoholdingsinc.com', status: 'live',   mrr: 0,    role: 'Holding Company' },
    { floor: 1,  name: 'OMNIAGUARD',              domain: 'omniaguard.com',           status: 'live',   mrr: 0,    role: 'AI Cybersecurity' },
    { floor: 2,  name: 'PrimeDox AI',             domain: 'primedoxai.com',           status: 'live',   mrr: 0,    role: 'Legal Document AI' },
    { floor: 3,  name: 'Kiaros',                  domain: 'kiaros.ca',                status: 'dev',    mrr: 0,    role: 'AI Scheduling' },
    { floor: 4,  name: 'SoulStack',               domain: 'soulstack.ai',             status: 'dev',    mrr: 0,    role: 'AI Observer' },
    { floor: 5,  name: 'CCLDR',                   domain: 'ccldr.ca',                 status: 'dev',    mrr: 0,    role: 'Cannabis Compliance' },
    { floor: 6,  name: 'Jarvis',                  domain: 'jarvis.franciscoholdingsinc.com', status: 'dev', mrr: 0, role: 'Empire Automation' },
    { floor: 7,  name: 'TechPetCage',             domain: 'techpetcage.com',          status: 'live',   mrr: 0,    role: 'E-Commerce' },
    { floor: 8,  name: 'VaultVelocity',           domain: 'vaultvelocity.io',         status: 'hold',   mrr: 0,    role: 'Financial Tools' },
    { floor: 9,  name: 'CleanSwarm',              domain: 'cleanswarm.com',           status: 'dev',    mrr: 0,    role: 'Cleaning Ops Platform' },
    { floor: 10, name: 'Nightingale',             domain: 'nightingale.ca',           status: 'dev',    mrr: 0,    role: 'Healthcare Scheduler' },
    { floor: 11, name: 'Vigilax',                 domain: 'vigilax.io',               status: 'hold',   mrr: 0,    role: 'Security Monitoring' },
  ];

  var ACTIVITY = [
    { icon: '⚡', color: 'rgba(0,212,255,0.15)', text: 'OMNIAGUARD site deployed to GitHub Pages', time: '2 min ago' },
    { icon: '💳', color: 'rgba(201,184,150,0.15)', text: 'PayPal handle confirmed: derekfranciaco1', time: '1 hr ago' },
    { icon: '🔐', color: 'rgba(157,78,221,0.15)', text: 'Cisco1170 access gate active on Command Center', time: '3 hr ago' },
    { icon: '📄', color: 'rgba(0,255,136,0.15)', text: 'Cannabis Compliance Article Part 1 published', time: '5 hr ago' },
    { icon: '🚀', color: 'rgba(255,51,0,0.15)', text: 'Jarvis AI platform v1.0 launched', time: '1 day ago' },
  ];

  var HEALTH = [
    { label: 'FHI Site',      val: 'LIVE',   cls: 'health-ok'   },
    { label: 'OMNIAGUARD',    val: 'LIVE',   cls: 'health-ok'   },
    { label: 'PrimeDox AI',   val: 'LIVE',   cls: 'health-ok'   },
    { label: 'Stripe',        val: 'SETUP NEEDED', cls: 'health-warn' },
    { label: 'PayPal',        val: 'ACTIVE', cls: 'health-ok'   },
    { label: 'API Backend',   val: 'DEPLOY NEEDED', cls: 'health-warn' },
  ];

  /* ── CLOCK ── */
  function startClock() {
    var el = document.getElementById('clock');
    if (!el) return;
    function tick() {
      var now = new Date();
      el.textContent = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ── NAV ── */
  function initNav() {
    var btns = document.querySelectorAll('.nav-btn[data-view]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.view;
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
        var view = document.getElementById('view-' + id);
        if (view) view.classList.add('active');
      });
    });
  }

  /* ── FLOOR TABLE ── */
  function buildFloors(query) {
    var tbody = document.getElementById('floor-tbody');
    if (!tbody) return;
    var data = query
      ? FLOORS.filter(function (f) {
          var q = query.toLowerCase();
          return f.name.toLowerCase().includes(q) || f.role.toLowerCase().includes(q) || String(f.floor).includes(q);
        })
      : FLOORS;

    tbody.innerHTML = data.map(function (f) {
      var badgeCls = f.status === 'live' ? 'badge-live' : f.status === 'dev' ? 'badge-dev' : 'badge-hold';
      return '<tr>' +
        '<td style="font-family:var(--font-code);color:var(--muted);font-size:11px;">' + f.floor + '</td>' +
        '<td style="font-weight:600;letter-spacing:1px;">' + f.name + '</td>' +
        '<td style="color:var(--muted);">' + f.role + '</td>' +
        '<td><a href="https://' + f.domain + '" target="_blank" rel="noopener" style="color:var(--cyan);font-size:11px;text-decoration:none;">' + f.domain + '</a></td>' +
        '<td><span class="floor-badge ' + badgeCls + '">' + f.status.toUpperCase() + '</span></td>' +
        '<td style="font-family:var(--font-code);color:var(--gold);">' + (f.mrr > 0 ? '$' + f.mrr.toLocaleString() + '/mo' : '—') + '</td>' +
        '</tr>';
    }).join('');
  }

  /* ── ACTIVITY FEED ── */
  function buildActivity() {
    var el = document.getElementById('activity-feed');
    if (!el) return;
    el.innerHTML = ACTIVITY.map(function (a) {
      return '<div class="activity-item">' +
        '<div class="activity-icon" style="background:' + a.color + ';">' + a.icon + '</div>' +
        '<div><div class="activity-text">' + a.text + '</div>' +
        '<div class="activity-time">' + a.time + '</div></div>' +
        '</div>';
    }).join('');
  }

  /* ── HEALTH ── */
  function buildHealth() {
    var el = document.getElementById('health-panel');
    if (!el) return;
    el.innerHTML = HEALTH.map(function (h) {
      return '<div class="health-row"><span class="health-label">' + h.label + '</span>' +
        '<span class="health-val ' + h.cls + '">' + h.val + '</span></div>';
    }).join('');
  }

  /* ── SEARCH ── */
  function initSearch() {
    var input = document.getElementById('floor-search');
    if (!input) return;
    input.addEventListener('input', function () { buildFloors(this.value); });
  }

  /* ── METRICS ── */
  function buildMetrics() {
    var liveCount = FLOORS.filter(function (f) { return f.status === 'live'; }).length;
    var devCount  = FLOORS.filter(function (f) { return f.status === 'dev';  }).length;
    var totalMrr  = FLOORS.reduce(function (s, f) { return s + f.mrr; }, 0);
    var el = document.getElementById('metric-live');   if (el) el.textContent = liveCount;
    var el2 = document.getElementById('metric-dev');   if (el2) el2.textContent = devCount;
    var el3 = document.getElementById('metric-floors');if (el3) el3.textContent = FLOORS.length;
    var el4 = document.getElementById('metric-mrr');   if (el4) el4.textContent = totalMrr > 0 ? '$' + totalMrr.toLocaleString() : '$0';
  }

  /* ── INIT ── */
  function init() {
    startClock();
    initNav();
    buildFloors();
    buildActivity();
    buildHealth();
    initSearch();
    buildMetrics();

    var firstNav = document.querySelector('.nav-btn[data-view]');
    if (firstNav) firstNav.click();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
