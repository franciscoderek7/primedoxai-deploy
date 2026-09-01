/* Cisco1170 — Command Center Access Gate v3 */
(function () {
  var CODE = 'Cisco1170';
  var SK = 'cc_v3_auth';
  var LK = 'cc_v3_lock';
  var TTL = 86400000;
  var LOCK = 300000;

  function isAuthed() {
    try {
      var d = JSON.parse(localStorage.getItem(SK) || 'null');
      return d && d.exp > Date.now();
    } catch (e) { return false; }
  }

  function isLocked() {
    try {
      var l = JSON.parse(localStorage.getItem(LK) || 'null');
      return l && l.until > Date.now();
    } catch (e) { return false; }
  }

  function lockUntil() {
    try {
      var l = JSON.parse(localStorage.getItem(LK) || 'null');
      return l ? l.until : 0;
    } catch (e) { return 0; }
  }

  function setAuth() {
    localStorage.setItem(SK, JSON.stringify({ exp: Date.now() + TTL }));
  }

  function setLock() {
    localStorage.setItem(LK, JSON.stringify({ until: Date.now() + LOCK }));
  }

  function clearLock() {
    localStorage.removeItem(LK);
  }

  if (isAuthed()) return;

  document.documentElement.style.visibility = 'hidden';

  function mount() {
    var overlay = document.createElement('div');
    overlay.id = 'cisco-gate';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:999999',
      'background:#050508', 'display:flex', 'align-items:center',
      'justify-content:center', 'font-family:Orbitron,monospace'
    ].join(';');

    overlay.innerHTML = '<div style="text-align:center;padding:40px;">' +
      '<div style="font-size:11px;letter-spacing:6px;color:#00D4FF;text-transform:uppercase;margin-bottom:8px;">FRANCISCO HOLDINGS INC.</div>' +
      '<div style="font-size:22px;letter-spacing:4px;color:#C9B896;margin-bottom:4px;">COMMAND CENTER</div>' +
      '<div style="font-size:10px;letter-spacing:3px;color:#444;margin-bottom:40px;">RESTRICTED ACCESS — CISCO1170</div>' +
      '<div id="cisco-lock-msg" style="display:none;color:#FF3300;font-size:11px;letter-spacing:2px;margin-bottom:20px;"></div>' +
      '<input id="cisco-input" type="password" placeholder="ACCESS CODE" autocomplete="off" style="' +
        'background:transparent;border:1px solid rgba(0,212,255,0.3);color:#C9B896;' +
        'padding:14px 20px;font-family:Orbitron,monospace;font-size:13px;letter-spacing:4px;' +
        'text-align:center;outline:none;width:280px;display:block;margin:0 auto 16px;">' +
      '<button id="cisco-btn" style="' +
        'background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,212,255,0.25));' +
        'border:1px solid #00D4FF;color:#00D4FF;padding:12px 40px;' +
        'font-family:Orbitron,monospace;font-size:11px;letter-spacing:4px;cursor:pointer;' +
        'text-transform:uppercase;">AUTHENTICATE</button>' +
      '<div id="cisco-err" style="color:#FF3300;font-size:10px;letter-spacing:2px;margin-top:16px;min-height:16px;"></div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.documentElement.style.visibility = 'visible';

    var input = document.getElementById('cisco-input');
    var btn = document.getElementById('cisco-btn');
    var err = document.getElementById('cisco-err');
    var lockMsg = document.getElementById('cisco-lock-msg');

    function checkLock() {
      if (isLocked()) {
        var remaining = Math.ceil((lockUntil() - Date.now()) / 1000);
        lockMsg.style.display = 'block';
        lockMsg.textContent = 'ACCESS LOCKED — ' + remaining + 's REMAINING';
        input.disabled = true;
        btn.disabled = true;
        setTimeout(checkLock, 1000);
      } else {
        lockMsg.style.display = 'none';
        input.disabled = false;
        btn.disabled = false;
        clearLock();
      }
    }

    if (isLocked()) { checkLock(); }

    function attempt() {
      if (isLocked()) return;
      if (input.value.trim() === CODE) {
        setAuth();
        overlay.remove();
      } else {
        setLock();
        err.textContent = 'ACCESS DENIED — LOCKED 5 MINUTES';
        input.value = '';
        checkLock();
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attempt();
    });
  }

  if (document.body) { mount(); }
  else { document.addEventListener('DOMContentLoaded', mount); }
})();
