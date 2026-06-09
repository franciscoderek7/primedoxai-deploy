if (!document.getElementById('omniaguard-badge')) {
  const badge = document.createElement('div');
  badge.id = 'omniaguard-badge';
  badge.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z" fill="currentColor"/>
      <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
    <span id="omniaguard-badge-text">Protected</span>
  `;
  document.body.appendChild(badge);

  function updateBadge(blocked, malware) {
    const el = document.getElementById('omniaguard-badge');
    const txt = document.getElementById('omniaguard-badge-text');
    if (!el || !txt) return;
    if (malware > 0) {
      el.className = 'og-danger';
      txt.textContent = `${malware} Threat${malware > 1 ? 's' : ''} Blocked`;
    } else if (blocked > 0) {
      el.className = 'og-warning';
      txt.textContent = `${blocked} Tracker${blocked > 1 ? 's' : ''} Blocked`;
    } else {
      el.className = '';
      txt.textContent = 'Protected';
    }
  }

  function pollStats() {
    chrome.runtime.sendMessage(
      { type: 'GET_STATS', tabId: -1 },
      (res) => {
        if (chrome.runtime.lastError) return;
        if (res) updateBadge(res.blocked, res.malware);
      }
    );
  }

  setInterval(pollStats, 2000);
  pollStats();

  // Auto-hide after 6s unless threats detected
  setTimeout(() => {
    const el = document.getElementById('omniaguard-badge');
    if (el && !el.classList.contains('og-danger') && !el.classList.contains('og-warning')) {
      el.classList.add('og-hidden');
    }
  }, 6000);

  document.getElementById('omniaguard-badge').addEventListener('click', () => {
    const el = document.getElementById('omniaguard-badge');
    el.classList.toggle('og-hidden');
  });
}
