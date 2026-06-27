const VPN_KEY = "omniguard_pwa_vpn";

function $(id) { return document.getElementById(id); }

function setBadge(badgeId, level) {
  const badge = $(badgeId);
  badge.className = "status-badge status-" + level;
  badge.textContent = level === "secure" ? "Secure" : level === "warning" ? "Warning" : "Critical";
}

function runScan() {
  const btn = $("scan-btn");
  const status = $("scan-status");
  btn.disabled = true;
  status.textContent = "Scanning network, exposure & device signals...";

  setTimeout(function () {
    const levels = ["secure", "secure", "secure", "warning", "critical"];
    const pick = function () { return levels[Math.floor(Math.random() * levels.length)]; };
    setBadge("badge-network", pick());
    setBadge("badge-exposure", pick());
    setBadge("badge-device", pick());
    status.textContent = "Scan complete — educational simulation, not a live network scan.";
    btn.disabled = false;
  }, 1400);
}

function toggleVpn() {
  const toggle = $("vpn-toggle");
  const on = toggle.dataset.on === "true";
  const next = !on;
  toggle.dataset.on = String(next);
  toggle.textContent = next ? "ON" : "OFF";
  localStorage.setItem(VPN_KEY, next ? "1" : "0");
}

function checkBroker() {
  const name = $("broker-name").value.trim();
  const email = $("broker-email").value.trim();
  const result = $("broker-result");
  if (!name || !email) {
    result.textContent = "Enter a name and email to run the check.";
    return;
  }
  result.textContent = "Checking...";
  setTimeout(function () {
    const found = Math.floor(Math.random() * 6);
    result.textContent = found === 0
      ? "No public listings found for " + name + " in this educational demo."
      : "Found " + found + " simulated public listing(s) for " + name + ". This is an educational demo, not a real data broker scan.";
  }, 900);
}

$("scan-btn").addEventListener("click", runScan);
$("vpn-toggle").addEventListener("click", toggleVpn);
$("broker-check-btn").addEventListener("click", checkBroker);

if (localStorage.getItem(VPN_KEY) === "1") toggleVpn();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}
