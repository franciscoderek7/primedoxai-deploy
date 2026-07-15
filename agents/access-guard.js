/**
 * AccessGuard — empire-wide page protection
 * Usage: <script src="...agents/access-guard.js"></script>
 * Reads window.ACCESS_GUARD_CONFIG (optional overrides) before DOMContentLoaded.
 *
 * Config shape (all optional):
 *   window.ACCESS_GUARD_CONFIG = {
 *     code: 'Cisco1170',          // override default
 *     sessionKey: 'ag_session',   // localStorage key for session token
 *     lockoutKey: 'ag_lockout',   // localStorage key for lockout timestamp
 *     sessionTTL: 86400000,       // ms — default 24 hours
 *     lockoutTTL: 300000,         // ms — default 5 minutes
 *     redirectOnFail: '/',        // redirect on lockout (optional, else just shows lockout msg)
 *   };
 */
;(function () {
  'use strict';

  const cfg = Object.assign(
    {
      code: 'Cisco1170',
      sessionKey: 'ag_session_v1',
      lockoutKey: 'ag_lockout_v1',
      sessionTTL: 86400000,
      lockoutTTL: 300000,
    },
    window.ACCESS_GUARD_CONFIG || {}
  );

  function isSessionValid() {
    try {
      const raw = localStorage.getItem(cfg.sessionKey);
      if (!raw) return false;
      const { ts } = JSON.parse(raw);
      return Date.now() - ts < cfg.sessionTTL;
    } catch (_) {
      return false;
    }
  }

  function getLockoutRemaining() {
    try {
      const raw = localStorage.getItem(cfg.lockoutKey);
      if (!raw) return 0;
      const { ts } = JSON.parse(raw);
      const elapsed = Date.now() - ts;
      return elapsed < cfg.lockoutTTL ? cfg.lockoutTTL - elapsed : 0;
    } catch (_) {
      return 0;
    }
  }

  function setLockout() {
    localStorage.setItem(cfg.lockoutKey, JSON.stringify({ ts: Date.now() }));
  }

  function grantSession() {
    localStorage.setItem(cfg.sessionKey, JSON.stringify({ ts: Date.now() }));
  }

  function buildOverlay() {
    const el = document.createElement('div');
    el.id = 'ag-overlay';
    el.style.cssText = [
      'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center',
      'background:#050d05;font-family:system-ui,sans-serif;',
    ].join(';');
    el.innerHTML = `
<div style="background:#0a160a;border:1px solid #1a3a1a;border-radius:16px;padding:48px 40px;max-width:420px;width:90%;text-align:center;box-shadow:0 0 80px rgba(16,185,129,0.15)">
  <div style="font-size:36px;margin-bottom:8px">🔐</div>
  <div style="color:#10b981;font-size:11px;font-weight:700;letter-spacing:4px;margin-bottom:4px">FRANCISCO HOLDINGS INC.</div>
  <div style="color:#c9a227;font-size:22px;font-weight:700;margin-bottom:6px">SECURE ACCESS REQUIRED</div>
  <div style="color:#4a7c59;font-size:13px;margin-bottom:32px">Authorised personnel only</div>
  <div id="ag-msg" style="min-height:36px;margin-bottom:16px"></div>
  <input
    id="ag-input"
    type="password"
    placeholder="Enter access code"
    autocomplete="off"
    style="width:100%;box-sizing:border-box;padding:14px 18px;background:#0f220f;border:1px solid #1e4d2b;border-radius:8px;color:#e5e4e2;font-size:16px;outline:none;letter-spacing:2px;text-align:center"
  />
  <button
    id="ag-btn"
    style="margin-top:16px;width:100%;padding:14px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:8px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:1px"
  >ENTER</button>
  <div style="color:#2d5a3d;font-size:11px;margin-top:24px">Session expires after 24 hours</div>
</div>`;
    return el;
  }

  function showMsg(el, text, colour) {
    el.style.color = colour || '#ef4444';
    el.style.fontSize = '13px';
    el.style.fontWeight = '600';
    el.textContent = text;
  }

  function startCountdown(msgEl, remaining, onExpire) {
    function tick() {
      const rem = Math.ceil(remaining / 1000);
      if (rem <= 0) { onExpire(); return; }
      showMsg(msgEl, `Access locked — retry in ${rem}s`, '#f59e0b');
      remaining -= 1000;
      setTimeout(tick, 1000);
    }
    tick();
  }

  function mountGuard() {
    // Already valid — let the page load normally
    if (isSessionValid()) return;

    // Hide page content until authenticated
    document.documentElement.style.visibility = 'hidden';

    function init() {
      const overlay = buildOverlay();
      document.body.appendChild(overlay);
      document.documentElement.style.visibility = '';
      overlay.style.display = 'flex';

      const input = document.getElementById('ag-input');
      const btn = document.getElementById('ag-btn');
      const msg = document.getElementById('ag-msg');

      function checkLockout() {
        const rem = getLockoutRemaining();
        if (rem > 0) {
          input.disabled = true;
          btn.disabled = true;
          btn.style.opacity = '0.4';
          startCountdown(msg, rem, () => {
            input.disabled = false;
            btn.disabled = false;
            btn.style.opacity = '1';
            msg.textContent = '';
            input.value = '';
            input.focus();
          });
          return true;
        }
        return false;
      }

      checkLockout();
      if (!input.disabled) setTimeout(() => input.focus(), 100);

      function attempt() {
        if (checkLockout()) return;
        const val = input.value.trim();
        if (val === cfg.code) {
          grantSession();
          overlay.remove();
        } else {
          setLockout();
          input.value = '';
          checkLockout();
        }
      }

      btn.addEventListener('click', attempt);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') attempt();
      });
    }

    if (document.body) {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init);
    }
  }

  mountGuard();
})();
