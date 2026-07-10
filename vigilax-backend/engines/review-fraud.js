/**
 * VIGILAX — Review Fraud Detection Engine
 * NLP authenticity scoring for reviews across all platforms.
 * Algorithms: lexical diversity, burst detection, generic phrase matching, reviewer credibility.
 */

'use strict';

// ── Generic / templated phrase patterns ─────────────────────────────────────

const GENERIC_PHRASES = [
  /\b(great|amazing|excellent|wonderful|fantastic|awesome|perfect|outstanding)\s+(product|service|experience|company|team|staff|place)\b/i,
  /\bhighly\s+recommend\b/i,
  /\b5\s+stars?\b/i,
  /\b(will|would)\s+(definitely|certainly|for sure)\s+(use|come|return|buy|recommend)\s+again\b/i,
  /\bno\s+complaints?\b/i,
  /\bvery\s+happy\s+with\b/i,
  /\bjust\s+what\s+i\s+(needed|was looking for|wanted)\b/i,
  /\b(fast|quick|prompt)\s+(shipping|delivery|response|service)\b/i,
  /\bexceeded\s+my\s+expectations\b/i,
  /\bA\+\+\+?\b/i,
];

const SUSPICIOUS_PATTERNS = [
  /\b(bought|purchased|ordered)\s+\d+\s+(times?|orders?)\b/i, // fake volume claims
  /\bverified\s+(buyer|purchaser|customer)\b/i,               // fake verification claims
  /\bcheck\s+out\s+our\s+website\b/i,                        // competitor spam
  /\buse\s+code\s+[A-Z0-9]{4,}\b/i,                          // promo codes in reviews
  /\bfollow\s+us\s+on\b/i,                                    // social spam
];

// ── Lexical analysis ─────────────────────────────────────────────────────────

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function lexicalDiversity(text) {
  const tokens = tokenize(text);
  if (tokens.length === 0) return 0;
  const unique = new Set(tokens).size;
  return unique / tokens.length; // Type-Token Ratio (TTR). Lower = more repetitive.
}

function avgSentenceLength(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 2);
  if (!sentences.length) return 0;
  const lengths = sentences.map(s => tokenize(s).length);
  return lengths.reduce((s, v) => s + v, 0) / lengths.length;
}

function exclamationDensity(text) {
  const exclamations = (text.match(/!/g) || []).length;
  const words = tokenize(text).length;
  return words > 0 ? exclamations / words : 0;
}

// ── Sentiment extremism ──────────────────────────────────────────────────────

const EXTREME_POSITIVE = /\b(best|greatest|perfect|flawless|love|loved|obsessed|addicted|life.?changing|game.?changer)\b/i;
const EXTREME_NEGATIVE = /\b(worst|terrible|horrible|disgusting|scam|fraud|garbage|trash|awful|never again)\b/i;

function sentimentExtremism(text) {
  const posHits = (text.match(EXTREME_POSITIVE) || []).length;
  const negHits = (text.match(EXTREME_NEGATIVE) || []).length;
  const total = tokenize(text).length;
  const rate = total > 0 ? (posHits + negHits) / total : 0;
  return { positive_extremes: posHits, negative_extremes: negHits, extremism_rate: rate };
}

// ── Reviewer profile scoring ─────────────────────────────────────────────────

function scoreReviewer(reviewer) {
  let suspicion = 0;
  const flags = [];

  if (reviewer.account_age_days !== undefined && reviewer.account_age_days < 30) {
    suspicion += 25;
    flags.push(`New account (${reviewer.account_age_days} days old)`);
  }
  if (reviewer.total_reviews !== undefined && reviewer.total_reviews === 1) {
    suspicion += 20;
    flags.push('Single-review account');
  }
  if (reviewer.total_reviews !== undefined && reviewer.total_reviews > 50 && reviewer.avg_rating > 4.7) {
    suspicion += 15;
    flags.push(`Power reviewer with suspiciously high avg rating (${reviewer.avg_rating})`);
  }
  if (reviewer.profile_photo === false) {
    suspicion += 10;
    flags.push('No profile photo');
  }
  if (reviewer.reviews_same_day !== undefined && reviewer.reviews_same_day > 3) {
    suspicion += 20;
    flags.push(`Posted ${reviewer.reviews_same_day} reviews in same day`);
  }
  if (reviewer.similar_business_reviews !== undefined && reviewer.similar_business_reviews > 5) {
    suspicion += 15;
    flags.push(`Reviewed ${reviewer.similar_business_reviews} similar businesses`);
  }
  if (reviewer.location_mismatch) {
    suspicion += 10;
    flags.push('Reviewer location inconsistent with business location');
  }

  return { suspicion_score: Math.min(100, suspicion), flags };
}

// ── Burst detection ──────────────────────────────────────────────────────────

function detectBurst(reviews, windowHours = 24) {
  if (reviews.length < 3) return { burst_detected: false, bursts: [] };
  const sorted = [...reviews].sort((a, b) => a.timestamp - b.timestamp);
  const windowMs = windowHours * 3600000;
  const bursts = [];
  const minBurstCount = Math.max(3, Math.ceil(reviews.length * 0.20)); // 20% of total in one window = burst

  for (let i = 0; i < sorted.length; i++) {
    const windowEnd = sorted[i].timestamp + windowMs;
    const inWindow = sorted.filter(r => r.timestamp >= sorted[i].timestamp && r.timestamp <= windowEnd);
    if (inWindow.length >= minBurstCount) {
      const avgRating = inWindow.reduce((s, r) => s + (r.rating || 3), 0) / inWindow.length;
      bursts.push({
        window_start: new Date(sorted[i].timestamp).toISOString(),
        window_end: new Date(windowEnd).toISOString(),
        review_count: inWindow.length,
        avg_rating: parseFloat(avgRating.toFixed(1)),
        suspicious: true,
      });
      i += inWindow.length - 1; // skip past this window
    }
  }

  return { burst_detected: bursts.length > 0, bursts };
}

// ── Duplicate text detection ─────────────────────────────────────────────────

function jaccardSimilarity(textA, textB) {
  const tokA = new Set(tokenize(textA));
  const tokB = new Set(tokenize(textB));
  const intersection = new Set([...tokA].filter(t => tokB.has(t)));
  const union = new Set([...tokA, ...tokB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

function findDuplicates(reviews, threshold = 0.65) {
  const duplicates = [];
  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      const sim = jaccardSimilarity(reviews[i].text, reviews[j].text);
      if (sim >= threshold) {
        duplicates.push({
          review_a: reviews[i].id || i,
          review_b: reviews[j].id || j,
          similarity: parseFloat(sim.toFixed(3)),
          severity: sim >= 0.90 ? 'CRITICAL' : 'HIGH',
        });
      }
    }
  }
  return duplicates;
}

// ── Rating distribution analysis ─────────────────────────────────────────────

function ratingDistribution(reviews) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++; });
  const total = reviews.length;
  const pct = {};
  for (const [k, v] of Object.entries(dist)) pct[k] = total ? parseFloat((v / total * 100).toFixed(1)) : 0;

  const polarization = pct[5] + pct[1]; // high 1+5 star concentration = manipulation signal
  return {
    distribution: dist,
    percentages: pct,
    polarization_rate: parseFloat(polarization.toFixed(1)),
    avg_rating: total ? parseFloat((reviews.reduce((s, r) => s + (r.rating || 0), 0) / total).toFixed(2)) : 0,
    suspicious: pct[5] > 70 || pct[1] > 40 || polarization > 80,
  };
}

// ── Per-review scorer ────────────────────────────────────────────────────────

function scoreReview(review) {
  const text = review.text || '';
  const tokens = tokenize(text);
  let suspicion = 0;
  const flags = [];

  // Length extremes
  if (tokens.length < 5) { suspicion += 15; flags.push('Extremely short review'); }
  if (tokens.length > 500) { suspicion += 5; flags.push('Unusually long review'); }

  // Lexical diversity
  const ttr = lexicalDiversity(text);
  if (ttr < 0.40 && tokens.length > 10) { suspicion += 10; flags.push(`Low vocabulary diversity (TTR ${ttr.toFixed(2)})`); }

  // Generic phrases
  const genericCount = GENERIC_PHRASES.filter(p => p.test(text)).length;
  if (genericCount >= 2) { suspicion += genericCount * 8; flags.push(`${genericCount} generic marketing phrases detected`); }

  // Suspicious patterns
  const suspPatterns = SUSPICIOUS_PATTERNS.filter(p => p.test(text));
  if (suspPatterns.length > 0) { suspicion += 20; flags.push(`Suspicious pattern: ${suspPatterns.length} flagged phrases`); }

  // Exclamation density
  const exclDensity = exclamationDensity(text);
  if (exclDensity > 0.05) { suspicion += 10; flags.push(`High exclamation density (${(exclDensity * 100).toFixed(1)}%)`); }

  // Extremism
  const extremism = sentimentExtremism(text);
  if (extremism.extremism_rate > 0.08) { suspicion += 10; flags.push(`High sentiment extremism rate (${(extremism.extremism_rate * 100).toFixed(1)}%)`); }

  // Reviewer profile
  if (review.reviewer) {
    const reviewerScore = scoreReviewer(review.reviewer);
    suspicion += reviewerScore.suspicion_score * 0.5;
    flags.push(...reviewerScore.flags);
  }

  return {
    review_id: review.id,
    suspicion_score: Math.min(100, Math.round(suspicion)),
    flags,
    metrics: {
      token_count: tokens.length,
      lexical_diversity: parseFloat(ttr.toFixed(3)),
      avg_sentence_length: parseFloat(avgSentenceLength(text).toFixed(1)),
      exclamation_density: parseFloat(exclDensity.toFixed(4)),
      generic_phrase_count: genericCount,
      ...extremism,
    },
  };
}

// ── Main analyzer ────────────────────────────────────────────────────────────

/**
 * analyzeReviews(data, config)
 * data: {
 *   reviews: [{ id, text, rating, timestamp, reviewer: {...} }],
 *   platform: string,    // 'google' | 'trustpilot' | 'yelp' | ...
 *   business_id: string,
 * }
 */
function analyzeReviews(data, config = {}) {
  const reviews = data.reviews || [];
  const findings = [];
  let riskScore = 0;

  if (reviews.length === 0) {
    return { engine: 'review_fraud', verdict: 'INSUFFICIENT_DATA', risk_score: 0, findings: [] };
  }

  // Per-review scoring
  const reviewScores = reviews.map(r => scoreReview(r));
  const highSuspicion = reviewScores.filter(r => r.suspicion_score >= 50);
  if (highSuspicion.length > 0) {
    const rate = highSuspicion.length / reviews.length;
    riskScore += Math.min(30, rate * 60);
    findings.push({
      type: 'SUSPICIOUS_REVIEWS',
      severity: rate > 0.3 ? 'HIGH' : 'MEDIUM',
      description: `${highSuspicion.length} of ${reviews.length} reviews score ≥50 suspicion`,
      affected_count: highSuspicion.length,
      evidence: highSuspicion.slice(0, 3),
    });
  }

  // Burst detection
  const burst = detectBurst(reviews, config.burst_window_hours || 24);
  if (burst.burst_detected) {
    riskScore += 25;
    findings.push({
      type: 'REVIEW_BURST',
      severity: 'HIGH',
      description: `${burst.bursts.length} review burst(s) detected — unnatural volume in short windows`,
      affected_count: burst.bursts.reduce((s, b) => s + b.review_count, 0),
      evidence: burst.bursts,
    });
  }

  // Duplicate detection
  const duplicates = findDuplicates(reviews, config.similarity_threshold || 0.65);
  if (duplicates.length > 0) {
    riskScore += Math.min(25, duplicates.length * 8);
    findings.push({
      type: 'DUPLICATE_REVIEWS',
      severity: duplicates.some(d => d.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
      description: `${duplicates.length} near-duplicate review pair(s) found`,
      affected_count: duplicates.length * 2,
      evidence: duplicates,
    });
  }

  // Rating distribution
  const ratingDist = ratingDistribution(reviews);
  if (ratingDist.suspicious) {
    riskScore += 15;
    findings.push({
      type: 'RATING_MANIPULATION',
      severity: 'MEDIUM',
      description: `Suspicious rating distribution: ${ratingDist.percentages[5]}% five-star, ${ratingDist.percentages[1]}% one-star`,
      affected_count: reviews.length,
      evidence: ratingDist,
    });
  }

  riskScore = Math.min(100, Math.round(riskScore));
  const verdict = riskScore >= 70 ? 'FRAUDULENT' : riskScore >= 40 ? 'SUSPICIOUS' : riskScore >= 15 ? 'MONITOR' : 'CLEAN';

  return {
    engine: 'review_fraud',
    platform: data.platform,
    business_id: data.business_id,
    analyzed_at: new Date().toISOString(),
    total_reviews: reviews.length,
    risk_score: riskScore,
    verdict,
    severity: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 15 ? 'MEDIUM' : 'LOW',
    findings,
    rating_distribution: ratingDist,
    review_scores: reviewScores,
    duplicate_pairs: duplicates,
    burst_analysis: burst,
    recommended_action: verdict === 'FRAUDULENT'
      ? 'Flag reviews for platform removal, document evidence, consider legal action'
      : verdict === 'SUSPICIOUS'
      ? 'Report to platform moderation, increase monitoring, document patterns'
      : verdict === 'MONITOR'
      ? 'Track review velocity over next 30 days'
      : 'Review profile appears authentic',
  };
}

module.exports = { analyzeReviews, scoreReview, detectBurst, findDuplicates, ratingDistribution, lexicalDiversity };
