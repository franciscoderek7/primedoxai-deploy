/**
 * VIGILAX — Ad Fraud Detection Engine
 * Domain verification, pixel validation, placement quality, IVT detection.
 */

'use strict';

const https = require('https');
const http  = require('http');
const { URL } = require('url');

// ── Domain quality scoring ───────────────────────────────────────────────────

// Known MFA (Made-For-Advertising) domain patterns
const MFA_PATTERNS = [
  /\d{3,}-\d{3,}\.com$/,                        // 123-456.com pattern
  /[a-z]{8,}-[a-z]{8,}-[a-z]{6,}\.com$/,        // random-word-word-word.com
  /news(today|daily|now|feed|portal)\d*\.(com|net|org)$/i,
  /(viral|trending|breaking)(news|stories|post)\d*\.(com|net)$/i,
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.bid', '.loan', '.gq', '.ml', '.cf', '.ga', '.tk'];

const HIGH_RISK_CATEGORIES = [
  'adult', 'gambling', 'fake-news', 'hate-speech', 'piracy', 'malware',
];

function scoreDomain(domain) {
  let risk = 0;
  const flags = [];

  // TLD check
  const tld = domain.substring(domain.lastIndexOf('.'));
  if (SUSPICIOUS_TLDS.includes(tld.toLowerCase())) {
    risk += 20;
    flags.push(`Suspicious TLD: ${tld}`);
  }

  // MFA pattern
  if (MFA_PATTERNS.some(p => p.test(domain))) {
    risk += 35;
    flags.push('Domain matches Made-For-Advertising pattern');
  }

  // Numeric heavy domain (often parked/spam)
  const numericRatio = (domain.match(/\d/g) || []).length / domain.length;
  if (numericRatio > 0.3) {
    risk += 15;
    flags.push(`High numeric ratio in domain name (${(numericRatio * 100).toFixed(0)}%)`);
  }

  // Subdomain depth (4+ levels suspicious)
  const subdomainDepth = domain.split('.').length - 2;
  if (subdomainDepth >= 3) {
    risk += 10;
    flags.push(`Deep subdomain structure: ${subdomainDepth} levels`);
  }

  return { domain, risk_score: Math.min(100, risk), flags };
}

// ── Pixel validation ─────────────────────────────────────────────────────────

const KNOWN_PIXELS = {
  facebook:  /connect\.facebook\.net.*fbevents|pixel\.facebook\.com/,
  google_ads: /googlesyndication|doubleclick\.net|googletagmanager|googletagservices/,
  tiktok:    /analytics\.tiktok\.com|tiktokcdn\.com.*pixel/,
  snapchat:  /sc-static\.net.*pixel|snap\.licdn/,
  linkedin:  /snap\.licdn\.com|linkedin\.com\/px/,
  pinterest: /ct\.pinterest\.com/,
};

function validatePixel(pixelData) {
  const { url, expected_platform, placement_page, fires_on_correct_events } = pixelData;
  const issues = [];

  // Check it's a known pixel
  if (expected_platform && KNOWN_PIXELS[expected_platform]) {
    if (!KNOWN_PIXELS[expected_platform].test(url)) {
      issues.push(`Pixel URL doesn't match expected ${expected_platform} format`);
    }
  }

  // Check for pixel stuffing (hidden pixels)
  if (pixelData.element_size && (pixelData.element_size.width <= 1 || pixelData.element_size.height <= 1)) {
    issues.push('Pixel stuffing detected: element is 1x1 or smaller');
  }

  // Check placement consistency
  if (placement_page && pixelData.fired_from_page && placement_page !== pixelData.fired_from_page) {
    issues.push(`Page mismatch: pixel registered for ${placement_page} but fired from ${pixelData.fired_from_page}`);
  }

  // Event validation
  if (fires_on_correct_events === false) {
    issues.push('Pixel fires on incorrect event types (possible event inflation)');
  }

  return {
    pixel_url: url,
    platform: expected_platform,
    is_valid: issues.length === 0,
    issues,
    risk_level: issues.length >= 2 ? 'HIGH' : issues.length === 1 ? 'MEDIUM' : 'LOW',
  };
}

// ── Placement quality ─────────────────────────────────────────────────────────

function assessPlacement(placement) {
  const risks = [];
  let score = 100; // Start at 100, deduct for issues

  // Viewability
  if (placement.viewability_rate !== undefined) {
    if (placement.viewability_rate < 0.30) {
      score -= 40;
      risks.push(`Extremely low viewability: ${(placement.viewability_rate * 100).toFixed(0)}% (MRC min is 50%)`);
    } else if (placement.viewability_rate < 0.50) {
      score -= 20;
      risks.push(`Below MRC viewability standard: ${(placement.viewability_rate * 100).toFixed(0)}%`);
    }
  }

  // Ad stacking (multiple ads layered on top of each other)
  if (placement.stacked_ads) {
    score -= 35;
    risks.push('Ad stacking detected: multiple ads overlapping same placement');
  }

  // Hidden placement
  if (placement.visibility === 'hidden' || placement.z_index < 0) {
    score -= 50;
    risks.push('Ad placement hidden from user view');
  }

  // Domain category risk
  if (placement.content_category && HIGH_RISK_CATEGORIES.includes(placement.content_category)) {
    score -= 30;
    risks.push(`High-risk content category: ${placement.content_category}`);
  }

  // Suspicious geo (high-risk regions for ad fraud)
  const HIGH_FRAUD_GEOS = ['XX', 'AP', 'EU-unknown'];
  if (placement.geo && HIGH_FRAUD_GEOS.includes(placement.geo)) {
    score -= 15;
    risks.push(`High-risk traffic geography: ${placement.geo}`);
  }

  return {
    placement_id: placement.id,
    placement_score: Math.max(0, score),
    placement_grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
    risks,
    recommended_action: score < 40 ? 'BLOCK_PLACEMENT' : score < 60 ? 'FLAG_FOR_REVIEW' : 'ACCEPTABLE',
  };
}

// ── IVT (Invalid Traffic) detection ─────────────────────────────────────────

const IVT_DATACENTER_RANGES = [
  // Common cloud/datacenter IP ranges (simplified CIDR check)
  '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.',
  '100.64.', '192.0.2.', '198.18.', '198.19.',
];

function detectIVT(trafficSample) {
  const {
    ip_addresses = [],
    user_agents = [],
    session_duration_avg_ms = null,
    page_scroll_events = null,
    mouse_movement_detected = null,
    conversion_rate = null,
  } = trafficSample;

  let ivt_score = 0;
  const ivt_signals = [];

  // Datacenter IP detection
  const datacenterIPs = ip_addresses.filter(ip =>
    IVT_DATACENTER_RANGES.some(range => ip.startsWith(range))
  );
  if (datacenterIPs.length > 0) {
    const rate = datacenterIPs.length / ip_addresses.length;
    ivt_score += rate * 40;
    ivt_signals.push(`${(rate * 100).toFixed(0)}% traffic from datacenter IP ranges`);
  }

  // Session duration: bots often have <2s or exactly round number sessions
  if (session_duration_avg_ms !== null && session_duration_avg_ms < 2000) {
    ivt_score += 25;
    ivt_signals.push(`Average session ${session_duration_avg_ms}ms — below human threshold`);
  }

  // No scroll / mouse events
  if (page_scroll_events === 0 || page_scroll_events === false) {
    ivt_score += 15;
    ivt_signals.push('Zero page scroll events recorded — indicates non-human session');
  }
  if (mouse_movement_detected === false) {
    ivt_score += 10;
    ivt_signals.push('No mouse movement detected — bot signature');
  }

  // Impossible conversion rate (>20% = likely attributed fraud)
  if (conversion_rate !== null && conversion_rate > 0.20) {
    ivt_score += 20;
    ivt_signals.push(`Suspiciously high conversion rate: ${(conversion_rate * 100).toFixed(1)}%`);
  }

  return {
    ivt_score: Math.min(100, Math.round(ivt_score)),
    ivt_signals,
    estimated_ivt_rate: parseFloat((ivt_score / 100).toFixed(3)),
    traffic_quality: ivt_score < 10 ? 'HIGH' : ivt_score < 30 ? 'MEDIUM' : ivt_score < 60 ? 'LOW' : 'FRAUDULENT',
  };
}

// ── Publisher verification ───────────────────────────────────────────────────

async function verifyPublisherDomain(domain, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const url = `https://${domain}`;
    let parsed;
    try { parsed = new URL(url); } catch { return resolve({ reachable: false, error: 'Invalid domain' }); }

    const proto = parsed.protocol === 'https:' ? https : http;
    const req = proto.request({ hostname: parsed.hostname, path: '/', method: 'HEAD', timeout: timeoutMs,
      headers: { 'User-Agent': 'VIGILAX-Verifier/1.0' } }, (res) => {
      resolve({
        reachable: true,
        status_code: res.statusCode,
        server: res.headers.server || null,
        has_ads_txt: null, // Would require separate /ads.txt fetch
        ssl: parsed.protocol === 'https:',
        redirect_count: [301, 302, 307, 308].includes(res.statusCode) ? 1 : 0,
      });
    });
    req.on('error', (err) => resolve({ reachable: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ reachable: false, error: 'timeout' }); });
    req.end();
  });
}

// ── Main analyzer ────────────────────────────────────────────────────────────

/**
 * analyzeAds(data, config)
 * data: {
 *   campaign_id: string,
 *   domains: string[],
 *   pixels: [{ url, expected_platform, ... }],
 *   placements: [{ id, viewability_rate, ... }],
 *   traffic_sample: { ip_addresses, user_agents, session_duration_avg_ms, ... },
 * }
 */
async function analyzeAds(data, config = {}) {
  const findings = [];
  let riskScore = 0;

  // Domain scoring
  const domainScores = (data.domains || []).map(d => scoreDomain(d));
  const highRiskDomains = domainScores.filter(d => d.risk_score >= 40);
  if (highRiskDomains.length > 0) {
    const rate = highRiskDomains.length / domainScores.length;
    riskScore += Math.min(30, rate * 50);
    findings.push({
      type: 'DOMAIN_QUALITY',
      severity: rate > 0.3 ? 'HIGH' : 'MEDIUM',
      description: `${highRiskDomains.length} of ${domainScores.length} domains show MFA/fraud signals`,
      evidence: highRiskDomains,
    });
  }

  // Publisher reachability (async, up to 3 domains)
  if (config.verify_domains && data.domains?.length > 0) {
    const toVerify = data.domains.slice(0, 3);
    const verifyResults = await Promise.all(toVerify.map(d => verifyPublisherDomain(d)));
    const unreachable = verifyResults.filter(r => !r.reachable);
    if (unreachable.length > 0) {
      riskScore += unreachable.length * 10;
      findings.push({
        type: 'UNREACHABLE_PUBLISHER',
        severity: 'HIGH',
        description: `${unreachable.length} publisher domain(s) unreachable — possible ghost inventory`,
        evidence: unreachable,
      });
    }
  }

  // Pixel validation
  const pixelResults = (data.pixels || []).map(p => validatePixel(p));
  const invalidPixels = pixelResults.filter(p => !p.is_valid);
  if (invalidPixels.length > 0) {
    riskScore += Math.min(25, invalidPixels.length * 8);
    findings.push({
      type: 'PIXEL_ISSUES',
      severity: invalidPixels.some(p => p.risk_level === 'HIGH') ? 'HIGH' : 'MEDIUM',
      description: `${invalidPixels.length} pixel(s) fail validation`,
      evidence: invalidPixels,
    });
  }

  // Placement quality
  const placementResults = (data.placements || []).map(p => assessPlacement(p));
  const badPlacements = placementResults.filter(p => p.placement_score < 50);
  if (badPlacements.length > 0) {
    const rate = badPlacements.length / placementResults.length;
    riskScore += Math.min(25, rate * 50);
    findings.push({
      type: 'PLACEMENT_QUALITY',
      severity: rate > 0.4 ? 'HIGH' : 'MEDIUM',
      description: `${badPlacements.length} placement(s) grade D or F`,
      evidence: badPlacements,
    });
  }

  // IVT detection
  if (data.traffic_sample) {
    const ivt = detectIVT(data.traffic_sample);
    if (ivt.ivt_score >= 20) {
      riskScore += Math.min(25, ivt.ivt_score * 0.5);
      findings.push({
        type: 'INVALID_TRAFFIC',
        severity: ivt.ivt_score >= 60 ? 'CRITICAL' : ivt.ivt_score >= 40 ? 'HIGH' : 'MEDIUM',
        description: `IVT score ${ivt.ivt_score}/100 — ${(ivt.estimated_ivt_rate * 100).toFixed(0)}% estimated invalid traffic`,
        evidence: ivt,
      });
    }
  }

  riskScore = Math.min(100, Math.round(riskScore));
  const verdict = riskScore >= 70 ? 'FRAUDULENT' : riskScore >= 40 ? 'SUSPICIOUS' : riskScore >= 15 ? 'MONITOR' : 'CLEAN';

  return {
    engine: 'ad_fraud',
    campaign_id: data.campaign_id,
    analyzed_at: new Date().toISOString(),
    risk_score: riskScore,
    verdict,
    severity: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 15 ? 'MEDIUM' : 'LOW',
    findings,
    domain_scores: domainScores,
    pixel_results: pixelResults,
    placement_results: placementResults,
    recommended_action: verdict === 'FRAUDULENT'
      ? 'Pause all ad spend immediately. Request audit from ad platform. File fraud claim.'
      : verdict === 'SUSPICIOUS'
      ? 'Reduce spend on flagged domains/placements. Request ads.txt verification.'
      : verdict === 'MONITOR'
      ? 'Enable placement exclusion list, review weekly'
      : 'Campaign appears clean',
  };
}

module.exports = { analyzeAds, scoreDomain, validatePixel, assessPlacement, detectIVT, verifyPublisherDomain };
