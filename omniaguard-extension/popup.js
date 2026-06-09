async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadStats() {
  const tab = await getCurrentTab();
  if (!tab) return;

  chrome.runtime.sendMessage({ type: 'GET_STATS', tabId: tab.id }, (res) => {
    if (chrome.runtime.lastError || !res) return;
    document.getElementById('statBlocked').textContent = res.blocked || 0;
    document.getElementById('statTrackers').textContent = res.trackers || 0;
    document.getElementById('statMalware').textContent = res.malware || 0;

    const bar = document.getElementById('statusBar');
    const dot = document.getElementById('statusDot');
    const txt = document.getElementById('statusText');

    if (res.malware > 0) {
      bar.className = 'status-bar danger';
      dot.className = 'status-dot danger';
      txt.className = 'status-text danger';
      txt.textContent = `${res.malware} Threat${res.malware > 1 ? 's' : ''} Blocked — You're Safe`;
    } else if (res.blocked > 0) {
      txt.textContent = `${res.blocked} Tracker${res.blocked > 1 ? 's' : ''} Blocked This Page`;
    } else {
      txt.textContent = 'Active Protection — Clean Page';
    }
  });

  chrome.runtime.sendMessage({ type: 'GET_TOTAL' }, (res) => {
    if (chrome.runtime.lastError || !res) return;
    const n = res.total || 0;
    document.getElementById('lifetimeNum').textContent =
      n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
  });
}

function loadSettings() {
  chrome.storage.local.get(['trackers', 'malware', 'badge'], (res) => {
    document.getElementById('toggleTrackers').checked = res.trackers !== false;
    document.getElementById('toggleMalware').checked = res.malware !== false;
    document.getElementById('toggleBadge').checked = res.badge !== false;
  });
}

document.getElementById('toggleTrackers').addEventListener('change', (e) => {
  chrome.storage.local.set({ trackers: e.target.checked });
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: e.target.checked ? ['trackers'] : [],
    disableRulesetIds: e.target.checked ? [] : ['trackers']
  }).catch(() => {});
});

document.getElementById('toggleMalware').addEventListener('change', (e) => {
  chrome.storage.local.set({ malware: e.target.checked });
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: e.target.checked ? ['malware'] : [],
    disableRulesetIds: e.target.checked ? [] : ['malware']
  }).catch(() => {});
});

document.getElementById('toggleBadge').addEventListener('change', (e) => {
  chrome.storage.local.set({ badge: e.target.checked });
});

loadStats();
loadSettings();
setInterval(loadStats, 1500);
