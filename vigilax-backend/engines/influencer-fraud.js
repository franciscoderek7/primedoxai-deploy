/**
 * VIGILAX — Influencer Fraud Detection Engine
 * Follower authenticity, engagement quality, and audience validity analysis.
 * No external API calls — works on data provided by caller (fetched via Social API connectors).
 */

'use strict';

// ── Industry engagement benchmarks ──────────────────────────────────────────
// Source: industry studies 2024-2025

const ENGAGEMENT_BENCHMARKS = {
  nano:       { min_followers: 1000,    max_followers: 9999,    min_er: 1.5, max_er: 9.0,  avg_er: 5.0  },
  micro:      { min_followers: 10000,   max_followers: 49999,   min_er: 1.5, max_er: 6.0,  avg_er: 3.5  },
  mid_tier:   { min_followers: 50000,   max_followers: 249999,  min_er: 1.0, max_er: 4.5,  avg_er: 2.5  },
  macro:      { min_followers: 250000,  max_followers: 999999,  min_er: 0.8, max_er: 3.0,  avg_er: 1.8  },
  mega:       { min_followers: 1000000, max_followers: Infinity, min_er: 0.5, max_er: 2.0, avg_er: 1.2  },
};

const PLATFORM_MODIFIERS = {
  instagram: 1.0,
  tiktok:    2.5,
  youtube:   0.7,
  twitter:   0.4,
  facebook:  0.3,
  linkedin:  0.6,
};

// ── Tier classification ──────────────────────────────────────────────────────

function getInfluencerTier(followers) {
  for (const [tier, bench] of Object.entries(ENGAGEMENT_BENCHMARKS)) {
    if (followers >= bench.min_followers && followers <= bench.max_followers) return { tier, ...bench };
  }
  return ENGAGEMENT_BENCHMARKS.mega;
}

// ── Engagement rate ──────────────────────────────────────────────────────────

function calcEngagementRate(followers, avgLikes, avgComments, avgShares = 0) {
  if (!followers) return 0;
  return ((avgLikes + avgComments + avgShares) / followers) * 100;
}

// ── Follower growth anomaly ──────────────────────────────────────────────────

function analyzeGrowth(growthHistory) {
  if (!growthHistory || growthHistory.length < 2) return { anomalous: false };

  const dailyGrowthRates = [];
  for (let i = 1; i < growthHistory.length; i++) {
    const prev = growthHistory[i - 1].count;
    const curr = growthHistory[i].count;
    if (prev > 0) dailyGrowthRates.push((curr - prev) / prev);
  }

  const mean = dailyGrowthRates.reduce((s, v) => s + v, 0) / dailyGrowthRates.length;
  const std = Math.sqrt(dailyGrowthRates.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / dailyGrowthRates.length);

  const spikes = growthHistory.filter((p, i) => {
    if (i === 0) return false;
    const rate = (p.count - growthHistory[i - 1].count) / growthHistory[i - 1].count;
    return (rate - mean) / (std || 0.001) > 3; // Z > 3 standard deviations
  });

  return {
    anomalous: spikes.length > 0,
    avg_daily_growth_pct: parseFloat((mean * 100).toFixed(3)),
    spike_events: spikes.map(p => ({
      date: p.date,
      follower_count: p.count,
      note: 'Sudden follower spike — possible purchased followers',
    })),
    likely_purchased: spikes.length >= 2,
  };
}

// ── Comment quality analysis ─────────────────────────────────────────────────

const GENERIC_COMMENTS = [
  /^[❤️🔥💯👍🙌✨😍🎉]+$/u,          // emoji-only
  /^(great|amazing|nice|awesome|love|wow|cool|yes|ok|🙏)+[!.]*$/i,
  /^(follow me|follow back|check my profile|check out my page)/i,
  /^dm me|^i followed you/i,
];

function commentQualityScore(comments) {
  if (!comments || comments.length === 0) return { score: 50, generic_rate: 0, pod_detection: false };

  let genericCount = 0;
  for (const comment of comments) {
    const text = (comment.text || '').trim();
    if (GENERIC_COMMENTS.some(p => p.test(text))) genericCount++;
  }

  const genericRate = genericCount / comments.length;

  // Engagement pod detection: same small group commenting on every post
  const commenterFreq = {};
  for (const c of comments) {
    const id = c.user_id || c.username;
    if (id) commenterFreq[id] = (commenterFreq[id] || 0) + 1;
  }
  const repeatCommenters = Object.values(commenterFreq).filter(f => f > 3).length;
  const podDetected = repeatCommenters > 5;

  return {
    total_comments: comments.length,
    generic_count: genericCount,
    generic_rate: parseFloat((genericRate * 100).toFixed(1)),
    repeat_commenters: repeatCommenters,
    pod_detected: podDetected,
    quality_score: Math.max(0, 100 - genericRate * 100 - (podDetected ? 20 : 0)),
  };
}

// ── Fake follower estimation ─────────────────────────────────────────────────

function estimateFakeFollowers(profile) {
  let fakeEstimate = 0;
  const signals = [];

  const tier = getInfluencerTier(profile.followers);
  const platformMod = PLATFORM_MODIFIERS[profile.platform] || 1.0;
  const adjustedMaxER = tier.max_er * platformMod;
  const adjustedMinER = tier.min_er * platformMod;

  const er = calcEngagementRate(
    profile.followers,
    profile.avg_likes || 0,
    profile.avg_comments || 0,
    profile.avg_shares || 0,
  );

  // Engagement rate vs followers mismatch
  if (er < adjustedMinER * 0.5) {
    const deficit = adjustedMinER - er;
    // Estimate fake% from engagement deficit
    const impliedRealFollowers = profile.followers * (er / tier.avg_er);
    const fakeFollowers = Math.max(0, profile.followers - impliedRealFollowers);
    fakeEstimate = Math.min(95, (fakeFollowers / profile.followers) * 100);
    signals.push(`Engagement rate ${er.toFixed(2)}% far below ${tier.tier} tier minimum ${adjustedMinER}%`);
  }

  // Follower-following ratio
  if (profile.following && profile.followers) {
    const ratio = profile.followers / profile.following;
    if (profile.followers > 100000 && ratio < 1.5) {
      fakeEstimate = Math.max(fakeEstimate, 20);
      signals.push(`Suspicious follower/following ratio: ${ratio.toFixed(1)}x for ${tier.tier} account`);
    }
  }

  return {
    estimated_fake_pct: parseFloat(fakeEstimate.toFixed(1)),
    estimated_real_followers: Math.round(profile.followers * (1 - fakeEstimate / 100)),
    estimated_fake_followers: Math.round(profile.followers * (fakeEstimate / 100)),
    signals,
    tier: tier.tier,
    observed_er: parseFloat(er.toFixed(3)),
    expected_er_range: { min: adjustedMinER, max: adjustedMaxER },
  };
}

// ── Audience demographics validation ────────────────────────────────────────

function validateAudienceDemographics(demographics, targetAudience) {
  if (!demographics || !targetAudience) return { score: 50, mismatches: [] };

  const mismatches = [];
  let mismatchPenalty = 0;

  if (targetAudience.geo && demographics.top_countries) {
    const targetCountries = Array.isArray(targetAudience.geo) ? targetAudience.geo : [targetAudience.geo];
    const audCountries = demographics.top_countries.map(c => c.code || c.name);
    const overlap = targetCountries.filter(c => audCountries.includes(c));
    if (overlap.length === 0) {
      mismatchPenalty += 40;
      mismatches.push(`Geographic mismatch: target [${targetCountries.join(',')}], audience top [${audCountries.slice(0,3).join(',')}]`);
    }
  }

  if (targetAudience.age_range && demographics.age_distribution) {
    const [minAge, maxAge] = targetAudience.age_range;
    const relevantBuckets = Object.entries(demographics.age_distribution)
      .filter(([range]) => {
        const [lo] = range.split('-').map(Number);
        return lo >= minAge && lo <= maxAge;
      })
      .reduce((s, [, pct]) => s + pct, 0);
    if (relevantBuckets < 30) {
      mismatchPenalty += 25;
      mismatches.push(`Age mismatch: only ${relevantBuckets}% of audience in target age range`);
    }
  }

  return {
    audience_match_score: Math.max(0, 100 - mismatchPenalty),
    mismatches,
    audience_quality: mismatchPenalty === 0 ? 'GOOD' : mismatchPenalty < 30 ? 'FAIR' : 'POOR',
  };
}

// ── Main analyzer ────────────────────────────────────────────────────────────

/**
 * analyzeInfluencer(data, config)
 * data: {
 *   profile: { username, platform, followers, following, avg_likes, avg_comments, avg_shares },
 *   growth_history: [{ date, count }],
 *   recent_comments: [{ user_id, text, timestamp }],
 *   audience_demographics: { top_countries, age_distribution, gender },
 *   target_audience: { geo, age_range, interests },
 * }
 */
function analyzeInfluencer(data, config = {}) {
  const profile = data.profile || {};
  const findings = [];
  let riskScore = 0;

  if (!profile.followers) {
    return { engine: 'influencer_fraud', verdict: 'INSUFFICIENT_DATA', risk_score: 0, findings: [] };
  }

  const tier = getInfluencerTier(profile.followers);
  const fakeFollowers = estimateFakeFollowers(profile);

  // Fake follower estimate
  if (fakeFollowers.estimated_fake_pct >= 20) {
    const severity = fakeFollowers.estimated_fake_pct >= 50 ? 'CRITICAL' : fakeFollowers.estimated_fake_pct >= 30 ? 'HIGH' : 'MEDIUM';
    riskScore += fakeFollowers.estimated_fake_pct >= 50 ? 40 : fakeFollowers.estimated_fake_pct >= 30 ? 25 : 15;
    findings.push({
      type: 'FAKE_FOLLOWERS',
      severity,
      description: `~${fakeFollowers.estimated_fake_pct}% of followers estimated to be fake (${fakeFollowers.estimated_fake_followers.toLocaleString()} accounts)`,
      evidence: fakeFollowers,
    });
  }

  // Growth anomalies
  if (data.growth_history) {
    const growth = analyzeGrowth(data.growth_history);
    if (growth.anomalous) {
      riskScore += growth.likely_purchased ? 30 : 15;
      findings.push({
        type: 'FOLLOWER_PURCHASE',
        severity: growth.likely_purchased ? 'HIGH' : 'MEDIUM',
        description: `${growth.spike_events.length} suspicious follower spike(s) — probable purchased followers`,
        evidence: growth,
      });
    }
  }

  // Comment quality
  if (data.recent_comments) {
    const commentQuality = commentQualityScore(data.recent_comments);
    if (commentQuality.generic_rate > 50 || commentQuality.pod_detected) {
      riskScore += commentQuality.generic_rate > 70 ? 20 : 10;
      if (commentQuality.pod_detected) riskScore += 10;
      findings.push({
        type: 'ENGAGEMENT_MANIPULATION',
        severity: commentQuality.pod_detected ? 'HIGH' : 'MEDIUM',
        description: `${commentQuality.generic_rate}% generic comments${commentQuality.pod_detected ? ', engagement pod detected' : ''}`,
        evidence: commentQuality,
      });
    }
  }

  // Audience validation
  if (data.audience_demographics && data.target_audience) {
    const audienceMatch = validateAudienceDemographics(data.audience_demographics, data.target_audience);
    if (audienceMatch.audience_match_score < 60) {
      riskScore += 15;
      findings.push({
        type: 'AUDIENCE_MISMATCH',
        severity: audienceMatch.audience_match_score < 40 ? 'HIGH' : 'MEDIUM',
        description: `Audience match score ${audienceMatch.audience_match_score}/100 — influencer audience doesn't match campaign target`,
        evidence: audienceMatch,
      });
    }
  }

  riskScore = Math.min(100, Math.round(riskScore));
  const verdict = riskScore >= 70 ? 'FRAUDULENT' : riskScore >= 40 ? 'SUSPICIOUS' : riskScore >= 15 ? 'MONITOR' : 'CLEAN';

  return {
    engine: 'influencer_fraud',
    username: profile.username,
    platform: profile.platform,
    analyzed_at: new Date().toISOString(),
    tier: tier.tier,
    followers: profile.followers,
    risk_score: riskScore,
    verdict,
    severity: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 15 ? 'MEDIUM' : 'LOW',
    findings,
    fake_follower_analysis: fakeFollowers,
    recommended_action: verdict === 'FRAUDULENT'
      ? 'Do not proceed. Terminate contract if active. Report to platform if bought followers confirmed.'
      : verdict === 'SUSPICIOUS'
      ? 'Request audience insights screenshot, verify with third-party audit tool before payment'
      : verdict === 'MONITOR'
      ? 'Proceed with caution — track real engagement on sponsored posts'
      : 'Influencer appears authentic for tier',
    estimated_real_cpm: profile.avg_views
      ? parseFloat(((profile.avg_views * (1 - fakeFollowers.estimated_fake_pct / 100)) / 1000).toFixed(0))
      : null,
  };
}

module.exports = { analyzeInfluencer, calcEngagementRate, getInfluencerTier, estimateFakeFollowers, commentQualityScore };
