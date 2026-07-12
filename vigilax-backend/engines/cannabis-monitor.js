/**
 * VIGILAX — Cannabis Black Market Monitor
 * Monitors PUBLIC signals ONLY: social posts, public marketplaces, ads, public listings.
 * NEVER accesses private accounts, DMs, or scrapes authenticated content.
 * Cross-references against provincial licensing registries.
 *
 * Legal basis: Monitoring public advertisements is legal under CCSA/Health Canada framework.
 * All matches flagged for human review — system never auto-accuses.
 */

'use strict';

// ── Licensed operator signal patterns ───────────────────────────────────────

const UNLICENSED_INDICATORS = [
  // Price signals (licensed stores have regulated pricing; black market often undercuts)
  /\b(cheapest|lowest\s+price|beat\s+any\s+price|bulk\s+deal|wholesale\s+price)\b.*\bcannabis|weed|thc|cbd\b/i,
  // Delivery without license claim
  /\b(same.day|1.hour|rush)\s+delivery\b.*\b(weed|cannabis|oz|gram|ounce)\b/i,
  // Unlicensed product claims
  /\b(mail.order|mo[m]a?)\s+cannabis\b/i,
  /\btelegram.*cannabis|cannabis.*telegram\b/i,
  /\bwhatsapp.*\b(weed|cannabis|oz|gram)\b/i,
  // No license number displayed
  /\bno\s+license\s+required|no\s+id\s+required\b.*\bcannabis\b/i,
  // Quantity signals (retail limits in Canada: 30g/transaction)
  /\b(pound|lb|kilo|kg|100\s*g|200\s*g|500\s*g)\b.*\b(cannabis|weed|thc)\b/i,
  /\bbuy\s+\d+\s+(oz|ounce|gram)s?\s+get\s+\d+\s+free\b/i,
];

const LICENSED_SIGNALS = [
  /\blogcl\d{4,}/i,           // Ontario Cannabis Store license format
  /\bOCS\b/,                  // Ontario Cannabis Store branding
  /\bagco\b.*\blicence\b/i,   // AGCO licence mention
  /\bhealth\s+canada.*license/i,
  /\bcert\.\s*no\.\s*[A-Z0-9]{6,}/i,
];

// ── Provincial registry stub ──────────────────────────────────────────────────
// In production: connect to actual public registries:
// - Ontario: ontario.ca/page/cannabis-licence-list (public CSV)
// - BC: lcrb.gov.bc.ca (public list)
// - Alberta: aglc.ca (licensed retailers list)
// - Health Canada: https://www.canada.ca/en/health-canada/services/drugs-medication/cannabis/industry-licensees-registrants.html

const MOCK_LICENSED_OPERATORS = new Map([
  ['Fire & Flower', { province: 'ON', license: 'CRZ-2024-001', status: 'active' }],
  ['Canna Cabana',  { province: 'ON', license: 'CRZ-2024-002', status: 'active' }],
  ['Tokyo Smoke',   { province: 'ON', license: 'CRZ-2024-003', status: 'active' }],
]);

function checkLicenseRegistry(operatorName, province) {
  const found = MOCK_LICENSED_OPERATORS.get(operatorName);
  if (!found) return { found: false, note: 'Not found in public registry — registry lookup required for confirmation' };
  if (found.province !== province && province) return { found: true, ...found, province_mismatch: true };
  return { found: true, ...found };
}

// ── Public signal analysis ────────────────────────────────────────────────────

function analyzePublicSignal(signal) {
  const text = signal.text || signal.content || signal.title || '';
  const flags = [];
  let riskScore = 0;

  // Check for unlicensed indicators
  const unlicensedMatches = UNLICENSED_INDICATORS.filter(p => p.test(text));
  if (unlicensedMatches.length > 0) {
    riskScore += unlicensedMatches.length * 20;
    flags.push({
      type: 'UNLICENSED_INDICATOR',
      count: unlicensedMatches.length,
      description: `${unlicensedMatches.length} unlicensed activity indicator(s) in public content`,
    });
  }

  // Check for license signals (reduces risk)
  const licensedMatches = LICENSED_SIGNALS.filter(p => p.test(text));
  if (licensedMatches.length > 0) riskScore -= licensedMatches.length * 15;

  // Platform risk weighting
  const platformRisk = { telegram: 40, whatsapp: 35, craigslist: 30, kijiji: 25, facebook_marketplace: 20, instagram: 15, twitter: 10 };
  const platformMod = platformRisk[signal.platform?.toLowerCase()] || 0;
  riskScore += platformMod;

  // Delivery or shipping claims
  if (/\bship|deliver|mail\b/i.test(text) && /\bcannabis|weed|thc\b/i.test(text)) {
    riskScore += 25;
    flags.push({ type: 'ILLEGAL_DELIVERY', description: 'Shipping/delivery of cannabis claimed (illegal without specific license)' });
  }

  // Quantity threshold
  if (/\b(pound|lb|kilo|100g|200g)\b/i.test(text)) {
    riskScore += 20;
    flags.push({ type: 'EXCESSIVE_QUANTITY', description: 'Quantities exceeding retail limits advertised publicly' });
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    signal_id: signal.id || `sig_${Date.now()}`,
    source_url: signal.url || null,
    platform: signal.platform || 'unknown',
    captured_at: signal.timestamp || new Date().toISOString(),
    risk_score: riskScore,
    flags,
    // ETHICAL NOTE: Never auto-accuse. Always for human review.
    requires_human_review: riskScore >= 40,
    review_note: riskScore >= 40
      ? 'REVIEW REQUIRED: Automated signals indicate potential unlicensed activity. A licensed investigator must verify before any action.'
      : 'Monitor only — no action warranted at this time.',
    hash: require('crypto').createHash('sha256').update(text + (signal.url || '')).digest('hex'),
  };
}

// ── Main monitor ──────────────────────────────────────────────────────────────

/**
 * monitorPublicSignals(data, config)
 * data: {
 *   signals: [{ id, text, url, platform, timestamp }],
 *   operator_name?: string,
 *   province?: string,
 * }
 */
function monitorPublicSignals(data, config = {}) {
  const signals = data.signals || [];
  if (signals.length === 0) {
    return { engine: 'cannabis_monitor', verdict: 'NO_SIGNALS', risk_score: 0, analysis: [] };
  }

  const analysis = signals.map(s => analyzePublicSignal(s));
  const highRisk = analysis.filter(a => a.risk_score >= 60);
  const reviewRequired = analysis.filter(a => a.requires_human_review);

  // Registry check
  let registryResult = null;
  if (data.operator_name) {
    registryResult = checkLicenseRegistry(data.operator_name, data.province);
  }

  const maxScore = Math.max(...analysis.map(a => a.risk_score));
  const verdict = maxScore >= 70 ? 'HIGH_RISK_UNLICENSED'
    : maxScore >= 40 ? 'SUSPICIOUS_REVIEW_REQUIRED'
    : 'CLEAN';

  return {
    engine: 'cannabis_monitor',
    analyzed_at: new Date().toISOString(),
    signals_analyzed: signals.length,
    high_risk_signals: highRisk.length,
    review_required_count: reviewRequired.length,
    risk_score: maxScore,
    verdict,
    severity: maxScore >= 70 ? 'HIGH' : maxScore >= 40 ? 'MEDIUM' : 'LOW',
    analysis,
    registry_check: registryResult,
    regulatory_note: 'All findings are from PUBLIC sources only. NEVER access private communications. Forward to Health Canada Enforcement or AGCO for action.',
    reporting_channels: {
      health_canada: 'cannabis@canada.ca',
      agco_ontario: 'cannabis@agco.ca',
      rcmp_tipline: '1-800-387-0020 (Crime Stoppers)',
    },
    human_review_required: reviewRequired.length > 0,
    ethical_constraint: 'This system monitors public signals only. It does NOT access private accounts, messages, or any non-public data. All findings require human review before any action.',
  };
}

module.exports = { monitorPublicSignals, analyzePublicSignal, checkLicenseRegistry };
