/**
 * VIGILAX — Click Fraud Detection Engine
 * Statistical anomaly detection for ad click traffic.
 * Algorithms: Z-score, velocity analysis, bot signature matching, IP clustering.
 */

'use strict';

// ── Statistical helpers ─────────────────────────────────────────────────────

function mean(arr) {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function stdDev(arr) {
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function zScore(value, arr) {
  const m = mean(arr);
  const sd = stdDev(arr);
  return sd === 0 ? 0 : (value - m) / sd;
}

// Known bot user-agent signatures
const BOT_UA_PATTERNS = [
  /bot|crawl|spider|scrape|headless|phantom|selenium|puppeteer|playwright/i,
  /python-requests|curl|wget|axios|httpx|aiohttp/i,
  /go-http-client|java\//i,
  /dataminr|semrush|ahrefs|moz\.com|majestic/i,
];

function isBotUA(userAgent) {
  if (!userAgent) return { is_bot: true, reason: 'Missing user agent', confidence: 0.95 };
  for (const pattern of BOT_UA_PATTERNS) {
    if (pattern.test(userAgent)) return { is_bot: true, reason: `UA pattern: ${pattern.source.split('|')[0]}`, confidence: 0.98 };
  }
  return { is_bot: false, reason: null, confidence: 1.0 };
}

// ── Time-window bucketing ────────────────────────────────────────────────────

function bucketByWindow(events, windowMs = 3600000) {
  const buckets = new Map();
  for (const ev of events) {
    const bucket = Math.floor(ev.timestamp / windowMs) * windowMs;
    buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([ts, count]) => ({ ts, count, window_start: new Date(ts).toISOString() }));
}

// ── IP clustering ────────────────────────────────────────────────────────────

function clusterByIP(events) {
  const ipMap = new Map();
  for (const ev of events) {
    const ip = ev.ip || 'unknown';
    if (!ipMap.has(ip)) ipMap.set(ip, { ip, count: 0, first_seen: ev.timestamp, last_seen: ev.timestamp, user_agents: new Set() });
    const entry = ipMap.get(ip);
    entry.count++;
    entry.last_seen = Math.max(entry.last_seen, ev.timestamp);
    if (ev.user_agent) entry.user_agents.add(ev.user_agent);
  }
  return Array.from(ipMap.values()).map(e => ({
    ...e,
    user_agents: Array.from(e.user_agents),
    duration_ms: e.last_seen - e.first_seen,
    suspicious: e.count > 5 && e.duration_ms < 300000, // >5 clicks in <5 min from same IP
  })).sort((a, b) => b.count - a.count);
}

// ── CTR anomaly ─────────────────────────────────────────────────────────────

function ctrAnomaly(clicks, impressions, industryBenchmarkCTR = 0.02) {
  const observedCTR = impressions > 0 ? clicks / impressions : 0;
  const ratio = observedCTR / industryBenchmarkCTR;
  return {
    observed_ctr: parseFloat((observedCTR * 100).toFixed(3)),
    benchmark_ctr: parseFloat((industryBenchmarkCTR * 100).toFixed(3)),
    ratio,
    anomalous: ratio > 3.0 || ratio < 0.1,
    severity: ratio > 5 ? 'CRITICAL' : ratio > 3 ? 'HIGH' : ratio > 2 ? 'MEDIUM' : 'LOW',
  };
}

// ── Click velocity ───────────────────────────────────────────────────────────

function velocityAnalysis(events, windowSecs = 60) {
  if (events.length < 2) return { max_per_window: 0, suspicious_windows: [], verdict: 'INSUFFICIENT_DATA' };
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const windowMs = windowSecs * 1000;
  let maxWindow = 0;
  const suspiciousWindows = [];

  for (let i = 0; i < sorted.length; i++) {
    const windowEnd = sorted[i].timestamp + windowMs;
    let count = 0;
    for (let j = i; j < sorted.length && sorted[j].timestamp <= windowEnd; j++) count++;
    if (count > maxWindow) maxWindow = count;
    if (count >= 10) { // 10+ clicks in 60 seconds = suspicious
      suspiciousWindows.push({
        window_start: new Date(sorted[i].timestamp).toISOString(),
        click_count: count,
        severity: count >= 20 ? 'CRITICAL' : count >= 10 ? 'HIGH' : 'MEDIUM',
      });
    }
  }

  return {
    max_per_window: maxWindow,
    window_seconds: windowSecs,
    suspicious_windows: suspiciousWindows,
    verdict: suspiciousWindows.length > 0 ? 'SUSPICIOUS' : 'CLEAN',
  };
}

// ── Main analyzer ────────────────────────────────────────────────────────────

/**
 * analyzeClicks(data, config)
 * data: {
 *   events: [{ timestamp, ip, user_agent, session_id, country, device_type }],
 *   impressions: number,
 *   campaign_id: string,
 *   industry: string,
 * }
 * Returns: fraud score 0-100, evidence, findings
 */
function analyzeClicks(data, config = {}) {
  const {
    z_threshold = 2.5,
    ctr_benchmark = config.industryBenchmarkCTR || 0.02,
    window_hours = 1,
  } = config;

  const events = data.events || [];
  const findings = [];
  let riskScore = 0;

  // 1. Bot UA detection
  const botClicks = events.filter(e => isBotUA(e.user_agent).is_bot);
  const botRate = events.length ? botClicks.length / events.length : 0;
  if (botRate > 0.05) {
    const severity = botRate > 0.30 ? 'CRITICAL' : botRate > 0.10 ? 'HIGH' : 'MEDIUM';
    riskScore += botRate > 0.30 ? 40 : botRate > 0.10 ? 25 : 10;
    findings.push({
      type: 'BOT_TRAFFIC',
      severity,
      description: `${(botRate * 100).toFixed(1)}% of clicks match known bot signatures`,
      affected_count: botClicks.length,
      evidence: botClicks.slice(0, 5).map(e => ({ ip: e.ip, ua: e.user_agent })),
    });
  }

  // 2. IP clustering
  const ipClusters = clusterByIP(events);
  const suspiciousIPs = ipClusters.filter(c => c.suspicious);
  if (suspiciousIPs.length > 0) {
    riskScore += Math.min(30, suspiciousIPs.length * 5);
    findings.push({
      type: 'IP_CLUSTERING',
      severity: suspiciousIPs.length > 3 ? 'HIGH' : 'MEDIUM',
      description: `${suspiciousIPs.length} IP(s) generated rapid repeat clicks`,
      affected_count: suspiciousIPs.reduce((s, c) => s + c.count, 0),
      evidence: suspiciousIPs.slice(0, 5),
    });
  }

  // 3. Z-score anomaly on hourly windows
  const buckets = bucketByWindow(events, window_hours * 3600000);
  const counts = buckets.map(b => b.count);
  if (counts.length >= 3) {
    const anomalous = buckets.filter(b => Math.abs(zScore(b.count, counts)) > z_threshold);
    if (anomalous.length > 0) {
      riskScore += Math.min(25, anomalous.length * 8);
      findings.push({
        type: 'STATISTICAL_ANOMALY',
        severity: anomalous.length > 2 ? 'HIGH' : 'MEDIUM',
        description: `${anomalous.length} time window(s) show abnormal click volume (Z-score > ${z_threshold})`,
        affected_count: anomalous.reduce((s, b) => s + b.count, 0),
        evidence: anomalous.map(b => ({ ...b, z_score: parseFloat(zScore(b.count, counts).toFixed(2)) })),
      });
    }
  }

  // 4. Click velocity
  const velocity = velocityAnalysis(events, 60);
  if (velocity.suspicious_windows.length > 0) {
    riskScore += Math.min(30, velocity.suspicious_windows.length * 10);
    findings.push({
      type: 'CLICK_VELOCITY',
      severity: velocity.suspicious_windows[0].severity,
      description: `Burst clicking detected: ${velocity.max_per_window} clicks in 60 seconds`,
      affected_count: velocity.max_per_window,
      evidence: velocity.suspicious_windows,
    });
  }

  // 5. CTR anomaly
  if (data.impressions) {
    const ctr = ctrAnomaly(events.length, data.impressions, ctr_benchmark);
    if (ctr.anomalous) {
      riskScore += ctr.ratio > 5 ? 25 : 15;
      findings.push({
        type: 'CTR_ANOMALY',
        severity: ctr.severity,
        description: `CTR ${ctr.observed_ctr}% vs benchmark ${ctr.benchmark_ctr}% (ratio ${ctr.ratio.toFixed(1)}x)`,
        affected_count: events.length,
        evidence: ctr,
      });
    }
  }

  riskScore = Math.min(100, riskScore);
  const verdict = riskScore >= 70 ? 'FRAUDULENT' : riskScore >= 40 ? 'SUSPICIOUS' : riskScore >= 15 ? 'MONITOR' : 'CLEAN';

  return {
    engine: 'click_fraud',
    campaign_id: data.campaign_id,
    analyzed_at: new Date().toISOString(),
    total_clicks: events.length,
    impressions: data.impressions || null,
    risk_score: riskScore,
    verdict,
    severity: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 15 ? 'MEDIUM' : 'LOW',
    findings,
    ip_analysis: ipClusters.slice(0, 10),
    time_buckets: buckets,
    bot_click_count: botClicks.length,
    suspicious_ip_count: suspiciousIPs.length,
    recommended_action: verdict === 'FRAUDULENT' ? 'Block campaign immediately, request refund, report to platform'
      : verdict === 'SUSPICIOUS' ? 'Pause campaign, investigate IPs, request traffic quality report'
      : verdict === 'MONITOR' ? 'Enable enhanced monitoring, review weekly'
      : 'No action required',
  };
}

module.exports = { analyzeClicks, isBotUA, clusterByIP, velocityAnalysis, ctrAnomaly, zScore };
