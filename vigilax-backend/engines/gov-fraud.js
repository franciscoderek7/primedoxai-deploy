/**
 * VIGILAX — Government & Procurement Fraud Detection Engine
 * Contract fraud, bid rigging, vendor relationship mapping, expenditure anomalies.
 * Also covers: cannabis licensing verification, regulatory filing cross-reference.
 */

'use strict';

// ── Statistical helpers ─────────────────────────────────────────────────────

function mean(arr) { return arr.reduce((s, v) => s + v, 0) / (arr.length || 1); }
function stdDev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (arr.length || 1));
}

// ── Bid Rigging Detection ────────────────────────────────────────────────────

/**
 * Classic bid rigging patterns:
 * - Cover bidding: competitors submit non-competitive bids to make winner look legitimate
 * - Bid suppression: competitors withdraw or don't bid
 * - Bid rotation: companies take turns winning contracts
 * - Market allocation: competitors divide territories/contracts
 */

function detectBidRigging(tenders) {
  const patterns = [];
  let riskScore = 0;

  if (!tenders || tenders.length < 3) return { patterns: [], risk_score: 0, verdict: 'INSUFFICIENT_DATA' };

  // 1. Cover bidding: all bids from same tender very close except winner
  for (const tender of tenders) {
    const bids = tender.bids || [];
    if (bids.length < 2) continue;
    const amounts = bids.map(b => b.amount).sort((a, b) => a - b);
    const winner = amounts[0];
    const spreads = amounts.slice(1).map(a => (a - winner) / winner);

    // Cover bidding: losers are within 1-5% of winner (suspiciously close)
    const coverBids = spreads.filter(s => s > 0.0 && s < 0.05);
    if (coverBids.length >= bids.length - 1 && bids.length >= 3) {
      riskScore += 30;
      patterns.push({
        type: 'COVER_BIDDING',
        severity: 'HIGH',
        tender_id: tender.id,
        description: `All ${bids.length} bids within 5% of winning bid — statistically improbable`,
        winning_bid: winner,
        bid_spread_pct: spreads.map(s => parseFloat((s * 100).toFixed(2))),
      });
    }
  }

  // 2. Bid rotation: same vendors win in sequence
  const winners = tenders.map(t => (t.bids || []).find(b => b.winner)?.vendor_id).filter(Boolean);
  const winnerCounts = {};
  winners.forEach(w => { winnerCounts[w] = (winnerCounts[w] || 0) + 1; });

  // Check for equal distribution among top vendors (rotation signal)
  const topWinners = Object.entries(winnerCounts)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1]);

  if (topWinners.length >= 2) {
    const counts = topWinners.map(([, c]) => c);
    const cv = stdDev(counts) / mean(counts); // Coefficient of variation — lower = more equal
    if (cv < 0.2 && counts.reduce((s, c) => s + c, 0) >= tenders.length * 0.7) {
      riskScore += 25;
      patterns.push({
        type: 'BID_ROTATION',
        severity: 'HIGH',
        description: `Top vendors winning in near-equal rotation (CV ${cv.toFixed(3)}) — possible market sharing`,
        vendors: topWinners.map(([id, count]) => ({ vendor_id: id, wins: count })),
      });
    }
  }

  // 3. Bid suppression: tender with only 1 bidder repeatedly
  const singleBidTenders = tenders.filter(t => (t.bids || []).length === 1);
  if (singleBidTenders.length > tenders.length * 0.3) {
    riskScore += 20;
    patterns.push({
      type: 'BID_SUPPRESSION',
      severity: 'MEDIUM',
      description: `${singleBidTenders.length} of ${tenders.length} tenders had only 1 bidder (${(singleBidTenders.length / tenders.length * 100).toFixed(0)}%)`,
      affected_tenders: singleBidTenders.map(t => t.id),
    });
  }

  return {
    engine: 'bid_rigging',
    patterns,
    risk_score: Math.min(100, riskScore),
    verdict: riskScore >= 60 ? 'HIGH_RISK' : riskScore >= 30 ? 'SUSPICIOUS' : 'CLEAN',
    tenders_analyzed: tenders.length,
  };
}

// ── Vendor Relationship Mapping ──────────────────────────────────────────────

function mapVendorRelationships(vendors, contracts) {
  const relationships = [];
  const vendorMap = new Map(vendors.map(v => [v.id, v]));

  // Build contract adjacency
  const coWinners = new Map(); // vendor_a+vendor_b → shared contracts
  for (const contract of contracts) {
    const vendorList = contract.vendor_ids || [];
    for (let i = 0; i < vendorList.length; i++) {
      for (let j = i + 1; j < vendorList.length; j++) {
        const key = [vendorList[i], vendorList[j]].sort().join('|');
        if (!coWinners.has(key)) coWinners.set(key, []);
        coWinners.get(key).push(contract.id);
      }
    }
  }

  // Flag strong co-occurrence
  for (const [key, contractIds] of coWinners) {
    if (contractIds.length >= 3) {
      const [idA, idB] = key.split('|');
      const vendorA = vendorMap.get(idA);
      const vendorB = vendorMap.get(idB);
      relationships.push({
        vendor_a: { id: idA, name: vendorA?.name || idA },
        vendor_b: { id: idB, name: vendorB?.name || idB },
        shared_contracts: contractIds,
        contract_count: contractIds.length,
        risk_flag: contractIds.length >= 5 ? 'HIGH' : 'MEDIUM',
        note: 'Vendors frequently appear together — investigate for beneficial ownership or collusion',
      });
    }
  }

  // Address/director overlap
  for (let i = 0; i < vendors.length; i++) {
    for (let j = i + 1; j < vendors.length; j++) {
      const a = vendors[i], b = vendors[j];
      if (a.registered_address && b.registered_address && a.registered_address === b.registered_address) {
        relationships.push({
          vendor_a: { id: a.id, name: a.name },
          vendor_b: { id: b.id, name: b.name },
          type: 'SHARED_ADDRESS',
          address: a.registered_address,
          risk_flag: 'CRITICAL',
          note: 'Two competing vendors share the same registered address — strong collusion signal',
        });
      }
      if (a.directors && b.directors) {
        const overlap = a.directors.filter(d => b.directors.includes(d));
        if (overlap.length > 0) {
          relationships.push({
            vendor_a: { id: a.id, name: a.name },
            vendor_b: { id: b.id, name: b.name },
            type: 'SHARED_DIRECTOR',
            shared_directors: overlap,
            risk_flag: 'CRITICAL',
            note: `Shared director(s): ${overlap.join(', ')} — vendors are not independent`,
          });
        }
      }
    }
  }

  return relationships;
}

// ── Expenditure Anomaly ──────────────────────────────────────────────────────

function detectExpenditureAnomalies(transactions) {
  if (!transactions || transactions.length < 5) return { anomalies: [], verdict: 'INSUFFICIENT_DATA' };

  const anomalies = [];

  // 1. Just-under threshold clustering (split transactions to avoid approval limits)
  const thresholds = [5000, 10000, 25000, 50000, 100000, 250000];
  for (const threshold of thresholds) {
    const justUnder = transactions.filter(t =>
      t.amount >= threshold * 0.92 && t.amount < threshold &&
      t.amount > threshold * 0.80
    );
    if (justUnder.length >= 3) {
      anomalies.push({
        type: 'THRESHOLD_SPLITTING',
        severity: justUnder.length >= 5 ? 'CRITICAL' : 'HIGH',
        description: `${justUnder.length} transactions clustered just below $${threshold.toLocaleString()} approval threshold`,
        threshold,
        transactions: justUnder.map(t => ({ id: t.id, amount: t.amount, date: t.date, vendor: t.vendor })),
      });
    }
  }

  // 2. Sole-source concentration (one vendor getting disproportionate share)
  const vendorTotals = {};
  const grandTotal = transactions.reduce((s, t) => s + t.amount, 0);
  transactions.forEach(t => { vendorTotals[t.vendor_id || t.vendor] = (vendorTotals[t.vendor_id || t.vendor] || 0) + t.amount; });
  for (const [vendor, total] of Object.entries(vendorTotals)) {
    const share = total / grandTotal;
    if (share > 0.40 && grandTotal > 100000) {
      anomalies.push({
        type: 'VENDOR_CONCENTRATION',
        severity: share > 0.60 ? 'HIGH' : 'MEDIUM',
        description: `Vendor "${vendor}" received ${(share * 100).toFixed(1)}% of total expenditure ($${total.toLocaleString()})`,
        vendor, total_cad: total, share_pct: parseFloat((share * 100).toFixed(1)),
      });
    }
  }

  // 3. Weekend/holiday spending (unusual timing)
  const weekendTxns = transactions.filter(t => {
    if (!t.date) return false;
    const d = new Date(t.date).getDay();
    return d === 0 || d === 6;
  });
  if (weekendTxns.length > transactions.length * 0.20) {
    anomalies.push({
      type: 'TIMING_ANOMALY',
      severity: 'MEDIUM',
      description: `${weekendTxns.length} of ${transactions.length} transactions processed on weekends/holidays`,
      transactions: weekendTxns.slice(0, 5),
    });
  }

  // 4. Round number clustering (>30% round numbers = unusual)
  const roundNumbers = transactions.filter(t => t.amount % 1000 === 0 || t.amount % 500 === 0);
  if (roundNumbers.length > transactions.length * 0.30 && transactions.length >= 10) {
    anomalies.push({
      type: 'ROUND_NUMBER_PATTERN',
      severity: 'MEDIUM',
      description: `${roundNumbers.length} transactions (${(roundNumbers.length / transactions.length * 100).toFixed(0)}%) are round numbers — may indicate estimates/fabrication`,
      count: roundNumbers.length,
    });
  }

  const totalRisk = Math.min(100, anomalies.reduce((s, a) =>
    s + (a.severity === 'CRITICAL' ? 30 : a.severity === 'HIGH' ? 20 : 10), 0));

  return {
    anomalies,
    total_transactions: transactions.length,
    total_value: grandTotal,
    risk_score: totalRisk,
    verdict: totalRisk >= 60 ? 'HIGH_RISK' : totalRisk >= 30 ? 'SUSPICIOUS' : 'CLEAN',
  };
}

// ── Public Records Cross-Reference ───────────────────────────────────────────

function crossReference(entity, publicRecords) {
  const discrepancies = [];

  if (!publicRecords) return { discrepancies: [], verified: false };

  const record = publicRecords.find(r =>
    r.name?.toLowerCase() === entity.name?.toLowerCase() ||
    r.registration_number === entity.registration_number
  );

  if (!record) {
    return {
      discrepancies: [{ field: 'entity', issue: `"${entity.name}" not found in public records` }],
      verified: false,
      record_found: false,
    };
  }

  // Address mismatch
  if (entity.address && record.address && entity.address !== record.address) {
    discrepancies.push({ field: 'address', claimed: entity.address, official: record.address, severity: 'HIGH' });
  }

  // License status
  if (record.license_status && record.license_status !== 'active') {
    discrepancies.push({ field: 'license_status', issue: `License status: ${record.license_status}`, severity: 'CRITICAL' });
  }

  // Dissolution status
  if (record.dissolved || record.status === 'dissolved') {
    discrepancies.push({ field: 'entity_status', issue: 'Entity has been dissolved', severity: 'CRITICAL' });
  }

  return {
    discrepancies,
    verified: discrepancies.length === 0,
    record_found: true,
    official_record: record,
  };
}

// ── Main analyzer ────────────────────────────────────────────────────────────

/**
 * analyzeGovernmentData(data, config)
 * data: {
 *   tenders: [...],
 *   vendors: [...],
 *   contracts: [...],
 *   transactions: [...],
 *   entities_to_verify: [{ name, registration_number, address }],
 *   public_records: [...],
 * }
 */
function analyzeGovernmentData(data, config = {}) {
  const findings = [];
  let riskScore = 0;

  // Bid rigging
  if (data.tenders?.length >= 3) {
    const bidRigging = detectBidRigging(data.tenders);
    if (bidRigging.risk_score > 0) {
      riskScore += bidRigging.risk_score * 0.4;
      bidRigging.patterns.forEach(p => findings.push({ ...p, source: 'bid_rigging_engine' }));
    }
  }

  // Vendor relationships
  if (data.vendors?.length >= 2 && data.contracts?.length >= 1) {
    const relationships = mapVendorRelationships(data.vendors, data.contracts);
    const criticalRel = relationships.filter(r => r.risk_flag === 'CRITICAL');
    if (criticalRel.length > 0) {
      riskScore += Math.min(30, criticalRel.length * 15);
      findings.push({
        type: 'VENDOR_RELATIONSHIP_FLAGS',
        severity: 'CRITICAL',
        description: `${criticalRel.length} critical vendor relationship(s) detected`,
        evidence: criticalRel,
      });
    }
    const highRel = relationships.filter(r => r.risk_flag === 'HIGH');
    if (highRel.length > 0) {
      riskScore += Math.min(20, highRel.length * 5);
      findings.push({
        type: 'VENDOR_CO_OCCURRENCE',
        severity: 'HIGH',
        description: `${highRel.length} vendor pair(s) appear together in ≥3 contracts`,
        evidence: highRel,
      });
    }
  }

  // Expenditure anomalies
  if (data.transactions?.length >= 5) {
    const expenditure = detectExpenditureAnomalies(data.transactions);
    if (expenditure.risk_score > 0) {
      riskScore += expenditure.risk_score * 0.4;
      expenditure.anomalies.forEach(a => findings.push({ ...a, source: 'expenditure_engine' }));
    }
  }

  // Entity verification
  if (data.entities_to_verify?.length > 0 && data.public_records) {
    const verifications = data.entities_to_verify.map(e => crossReference(e, data.public_records));
    const failed = verifications.filter(v => !v.verified);
    if (failed.length > 0) {
      riskScore += Math.min(30, failed.length * 10);
      findings.push({
        type: 'ENTITY_VERIFICATION_FAILURE',
        severity: failed.some(v => v.discrepancies.some(d => d.severity === 'CRITICAL')) ? 'CRITICAL' : 'HIGH',
        description: `${failed.length} entity(ies) fail public records verification`,
        evidence: failed,
      });
    }
  }

  riskScore = Math.min(100, Math.round(riskScore));
  const verdict = riskScore >= 70 ? 'HIGH_RISK' : riskScore >= 40 ? 'SUSPICIOUS' : riskScore >= 15 ? 'MONITOR' : 'CLEAN';

  return {
    engine: 'gov_fraud',
    analyzed_at: new Date().toISOString(),
    risk_score: riskScore,
    verdict,
    severity: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 15 ? 'MEDIUM' : 'LOW',
    findings,
    tenders_analyzed: data.tenders?.length || 0,
    vendors_analyzed: data.vendors?.length || 0,
    transactions_analyzed: data.transactions?.length || 0,
    recommended_action: riskScore >= 70
      ? 'Escalate to legal counsel. Prepare evidence package. File with appropriate authority (RCMP Commercial Crime, OPP, CRA, CCSA as applicable).'
      : riskScore >= 40
      ? 'Conduct formal audit. Preserve records. Consult legal team before filing.'
      : riskScore >= 15
      ? 'Enhanced monitoring. Flag for next scheduled audit.'
      : 'No action required.',
    regulatory_bodies: {
      federal: ['RCMP Commercial Crime Unit', 'Competition Bureau', 'CRA Enforcement'],
      ontario: ['OPP Fraud Unit', 'Auditor General of Ontario', 'Ontario AGCO'],
      cannabis: ['Health Canada Enforcement', 'AGCO'],
    },
  };
}

module.exports = {
  analyzeGovernmentData,
  detectBidRigging,
  mapVendorRelationships,
  detectExpenditureAnomalies,
  crossReference,
};
