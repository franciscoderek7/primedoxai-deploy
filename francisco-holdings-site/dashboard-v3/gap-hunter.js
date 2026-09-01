/* Gap Hunter v3 — Revenue Gap Analysis Module */
/* Password gate: PHOENIX392 (sessionStorage) */
(function () {
  'use strict';

  var CODE = 'PHOENIX392';
  var SK   = 'gh_v3_auth';

  if (sessionStorage.getItem(SK) === '1') return;

  document.documentElement.style.visibility = 'hidden';

  function mount() {
    var overlay = document.createElement('div');
    overlay.id = 'gh-gate';
    overlay.style.cssText = [
      'position:fixed','inset:0','z-index:999998',
      'background:#050508','display:flex','align-items:center',
      'justify-content:center','font-family:Orbitron,monospace'
    ].join(';');

    overlay.innerHTML = '<div style="text-align:center;padding:40px;">' +
      '<div style="font-size:10px;letter-spacing:5px;color:#FF8000;text-transform:uppercase;margin-bottom:8px;">REVENUE INTELLIGENCE</div>' +
      '<div style="font-size:20px;letter-spacing:4px;color:#C9B896;margin-bottom:4px;">GAP HUNTER v3</div>' +
      '<div style="font-size:10px;letter-spacing:3px;color:#444;margin-bottom:36px;">AUTHORIZED PERSONNEL ONLY</div>' +
      '<input id="gh-input" type="password" placeholder="CLEARANCE CODE" autocomplete="off" style="' +
        'background:transparent;border:1px solid rgba(255,128,0,0.3);color:#C9B896;' +
        'padding:12px 18px;font-family:Orbitron,monospace;font-size:12px;letter-spacing:4px;' +
        'text-align:center;outline:none;width:260px;display:block;margin:0 auto 14px;">' +
      '<button id="gh-btn" style="' +
        'background:rgba(255,128,0,0.15);border:1px solid #FF8000;color:#FF8000;' +
        'padding:10px 36px;font-family:Orbitron,monospace;font-size:10px;letter-spacing:3px;cursor:pointer;' +
        'text-transform:uppercase;">VERIFY</button>' +
      '<div id="gh-err" style="color:#FF3300;font-size:10px;letter-spacing:2px;margin-top:14px;min-height:14px;"></div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.documentElement.style.visibility = 'visible';

    var input = document.getElementById('gh-input');
    var btn   = document.getElementById('gh-btn');
    var err   = document.getElementById('gh-err');

    function attempt() {
      if (input.value.trim() === CODE) {
        sessionStorage.setItem(SK, '1');
        overlay.remove();
        if (window.GapHunter && window.GapHunter.init) window.GapHunter.init();
      } else {
        err.textContent = 'INVALID CLEARANCE CODE';
        input.value = '';
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
    input.focus();
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();

/* ── GAP HUNTER CORE ── */
window.GapHunter = (function () {
  'use strict';

  var INDUSTRIES = {
    legal: {
      label: 'Legal / Law Firm',
      gaps: [
        { id: 'intake',     label: 'Manual Client Intake',      impact: 'HIGH',   lost: 2000,  fix: 'AI intake form + calendar booking' },
        { id: 'docs',       label: 'Document Drafting Time',    impact: 'HIGH',   lost: 4500,  fix: 'PrimeDox AI — instant drafts' },
        { id: 'followup',   label: 'No Automated Follow-Up',    impact: 'MED',    lost: 1200,  fix: 'Automated email sequences' },
        { id: 'billing',    label: 'Time Tracking Gaps',        impact: 'MED',    lost: 800,   fix: 'Matter-based billing capture' },
        { id: 'retention',  label: 'Client Retention < 40%',    impact: 'HIGH',   lost: 3000,  fix: 'Client portal + status alerts' },
      ],
    },
    cannabis: {
      label: 'Cannabis / Licensed Producer',
      gaps: [
        { id: 'reporting',  label: 'Health Canada Reporting',   impact: 'HIGH',   lost: 5000,  fix: 'CCLDR automated compliance stack' },
        { id: 'sops',       label: 'Paper-Based SOPs',          impact: 'HIGH',   lost: 2500,  fix: 'Digital SOP management' },
        { id: 'audits',     label: 'Pre-Inspection Prep',       impact: 'MED',    lost: 1800,  fix: 'AI-powered audit checklist' },
        { id: 'recall',     label: 'Recall Readiness',          impact: 'HIGH',   lost: 10000, fix: 'Lot-level traceability system' },
        { id: 'training',   label: 'Staff Compliance Training', impact: 'MED',    lost: 1200,  fix: 'LMS compliance modules' },
      ],
    },
    security: {
      label: 'Cybersecurity / MSP',
      gaps: [
        { id: 'monitoring', label: 'No AI Threat Monitoring',   impact: 'HIGH',   lost: 6000,  fix: 'OMNIAGUARD enterprise deployment' },
        { id: 'endpoints',  label: 'Unmanaged Endpoints',       impact: 'HIGH',   lost: 3500,  fix: 'Endpoint detection & response' },
        { id: 'incidents',  label: 'Slow Incident Response',    impact: 'HIGH',   lost: 8000,  fix: 'SOC playbook automation' },
        { id: 'reports',    label: 'No Executive Reporting',    impact: 'MED',    lost: 1000,  fix: 'Automated board-level reports' },
        { id: 'phishing',   label: 'Phishing Simulation Gaps',  impact: 'MED',    lost: 2000,  fix: 'Monthly phishing campaigns' },
      ],
    },
    cleaning: {
      label: 'Commercial Cleaning',
      gaps: [
        { id: 'dispatch',   label: 'Manual Job Dispatching',    impact: 'HIGH',   lost: 1500,  fix: 'CleanSwarm worker matching' },
        { id: 'quality',    label: 'No Quality Verification',   impact: 'MED',    lost: 800,   fix: 'Photo-based job confirmation' },
        { id: 'payroll',    label: 'Contractor Payroll Errors', impact: 'HIGH',   lost: 1200,  fix: 'Automated payout system' },
        { id: 'booking',    label: 'Missed Booking Follow-Ups', impact: 'MED',    lost: 600,   fix: 'AI reminder sequences' },
        { id: 'pricing',    label: 'No Dynamic Pricing',        impact: 'LOW',    lost: 400,   fix: 'Time/zone-based rate optimization' },
      ],
    },
  };

  var state = {
    industry: null,
    selected: {},
    email: '',
  };

  function renderIndustrySelect(container) {
    container.innerHTML = '<div class="card fade-in">' +
      '<div class="card-title">SELECT INDUSTRY</div>' +
      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">' +
      Object.entries(INDUSTRIES).map(function (kv) {
        return '<button onclick="window.GapHunter.setIndustry(\'' + kv[0] + '\')" style="' +
          'background:var(--card);border:1px solid var(--border);color:var(--text);' +
          'padding:16px;text-align:left;cursor:pointer;border-radius:4px;font-family:var(--font-body);' +
          'font-size:13px;letter-spacing:1px;transition:all 0.2s;" ' +
          'onmouseover="this.style.borderColor=\'var(--cyan)\'" ' +
          'onmouseout="this.style.borderColor=\'var(--border)\'">' +
          '<div style="font-size:18px;margin-bottom:6px;">' + getIcon(kv[0]) + '</div>' + kv[1].label +
          '</button>';
      }).join('') +
      '</div></div>';
  }

  function getIcon(ind) {
    return { legal: '⚖️', cannabis: '🌿', security: '🛡️', cleaning: '🧹' }[ind] || '🏢';
  }

  function renderGaps(container) {
    var ind = INDUSTRIES[state.industry];
    var totalLost = ind.gaps.reduce(function (s, g) { return s + g.lost; }, 0);

    container.innerHTML = '<div class="card fade-in">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
      '<div class="card-title" style="margin:0;">' + ind.label.toUpperCase() + ' — REVENUE GAPS</div>' +
      '<button onclick="window.GapHunter.reset()" style="background:transparent;border:1px solid var(--border);color:var(--muted);padding:4px 12px;cursor:pointer;font-size:10px;letter-spacing:2px;font-family:var(--font-hud);">← BACK</button>' +
      '</div>' +
      '<div style="background:rgba(255,51,0,0.08);border:1px solid rgba(255,51,0,0.2);padding:12px 16px;border-radius:4px;margin-bottom:16px;">' +
      '<span style="font-family:var(--font-code);font-size:11px;color:var(--muted);">ESTIMATED MONTHLY LEAK: </span>' +
      '<span style="font-family:var(--font-hud);font-size:18px;color:var(--red);">$' + totalLost.toLocaleString() + '/mo</span>' +
      '</div>' +
      ind.gaps.map(function (g) {
        var impactColor = g.impact === 'HIGH' ? 'var(--red)' : g.impact === 'MED' ? '#FFB800' : 'var(--muted)';
        return '<div style="border:1px solid var(--border);border-radius:4px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">' +
          '<input type="checkbox" id="gap-' + g.id + '" onchange="window.GapHunter.toggle(\'' + g.id + '\')" style="width:16px;height:16px;cursor:pointer;accent-color:var(--cyan);">' +
          '<div style="flex:1;">' +
          '<div style="font-weight:600;letter-spacing:1px;margin-bottom:4px;">' + g.label + '</div>' +
          '<div style="font-size:11px;color:var(--muted);">' + g.fix + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
          '<div style="font-family:var(--font-code);font-size:13px;color:var(--red);">-$' + g.lost.toLocaleString() + '</div>' +
          '<div style="font-size:9px;color:' + impactColor + ';letter-spacing:2px;">' + g.impact + '</div>' +
          '</div>' +
          '</div>';
      }).join('') +
      '<div style="margin-top:16px;">' +
      '<div class="card-title">YOUR RECOVERY PLAN</div>' +
      '<input id="gh-email" type="email" placeholder="Email for gap report" style="' +
        'background:var(--surface);border:1px solid var(--border);color:var(--text);' +
        'padding:10px 14px;font-family:var(--font-body);font-size:13px;outline:none;' +
        'width:100%;margin-bottom:10px;border-radius:4px;">' +
      '<a href="https://paypal.me/derekfranciaco1/500" target="_blank" rel="noopener" class="btn btn-gold" style="display:block;text-align:center;margin-bottom:8px;">BOOK GAP AUDIT — $500</a>' +
      '<button onclick="window.GapHunter.saveReport()" class="btn btn-primary" style="width:100%;justify-content:center;">SAVE REPORT TO DASHBOARD</button>' +
      '</div>' +
      '</div>';
  }

  function setIndustry(ind) {
    state.industry = ind;
    state.selected = {};
    var c = document.getElementById('gh-content');
    if (c) renderGaps(c);
  }

  function toggle(id) {
    state.selected[id] = !state.selected[id];
  }

  function reset() {
    state.industry = null;
    state.selected = {};
    var c = document.getElementById('gh-content');
    if (c) renderIndustrySelect(c);
  }

  function saveReport() {
    var emailEl = document.getElementById('gh-email');
    var email = emailEl ? emailEl.value.trim() : '';
    if (!email) { alert('Enter email to save report.'); return; }
    var ind = INDUSTRIES[state.industry];
    var gaps = ind.gaps.filter(function (g) { return state.selected[g.id]; });
    var report = {
      ts: Date.now(),
      industry: state.industry,
      email: email,
      gaps: gaps.map(function (g) { return g.label; }),
      totalLost: gaps.reduce(function (s, g) { return s + g.lost; }, 0),
    };
    var reports = [];
    try { reports = JSON.parse(localStorage.getItem('gh_v3_reports') || '[]'); } catch (e) {}
    reports.unshift(report);
    localStorage.setItem('gh_v3_reports', JSON.stringify(reports.slice(0, 50)));
    alert('Report saved. Total identified leak: $' + report.totalLost.toLocaleString() + '/mo');
  }

  function init() {
    var container = document.getElementById('gh-content');
    if (!container) return;
    if (state.industry) renderGaps(container);
    else renderIndustrySelect(container);
  }

  return { init: init, setIndustry: setIndustry, toggle: toggle, reset: reset, saveReport: saveReport };
})();
