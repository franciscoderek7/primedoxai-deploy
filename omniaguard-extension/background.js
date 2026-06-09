const tabStats = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabStats[tabId] = { blocked: 0, trackers: 0, malware: 0 };
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabStats[tabId];
});

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  const tabId = info.request.tabId;
  if (tabId < 0) return;
  if (!tabStats[tabId]) tabStats[tabId] = { blocked: 0, trackers: 0, malware: 0 };
  tabStats[tabId].blocked++;
  if (info.rule.rulesetId === 'malware') {
    tabStats[tabId].malware++;
  } else {
    tabStats[tabId].trackers++;
  }
  updateBadge(tabId);
});

function updateBadge(tabId) {
  const stats = tabStats[tabId];
  if (!stats) return;
  const count = stats.blocked;
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : '', tabId });
  chrome.action.setBadgeBackgroundColor({
    color: stats.malware > 0 ? '#ef4444' : count > 0 ? '#f59e0b' : '#10b981',
    tabId
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_STATS') {
    const tabId = msg.tabId;
    sendResponse(tabStats[tabId] || { blocked: 0, trackers: 0, malware: 0 });
  }
  if (msg.type === 'GET_TOTAL') {
    chrome.storage.local.get(['totalBlocked'], (res) => {
      sendResponse({ total: res.totalBlocked || 0 });
    });
    return true;
  }
});

// Increment lifetime total every 60s from active tabs
setInterval(async () => {
  let session = 0;
  for (const id in tabStats) session += tabStats[id].blocked;
  chrome.storage.local.get(['totalBlocked'], (res) => {
    chrome.storage.local.set({ totalBlocked: (res.totalBlocked || 0) + session });
  });
}, 60000);
