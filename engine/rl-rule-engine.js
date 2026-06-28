/**
 * engine/rl-rule-engine.js
 *
 * THE CORE IDEA — read this before the code below:
 *
 * This file is "PrimeDox." Not the chat app, not the legal-document tool —
 * the underlying brain. Every named instance you see elsewhere in the empire
 * (Timmy watching for anomalies, PrimeDox AI scoring its own document
 * suggestions, and any future brand from A to Z) is the SAME class below,
 * constructed with a different name and a different rule domain. The brand
 * is a costume. The scoring loop underneath never changes.
 *
 * THIS IS A STATIC RULE SCORER, NOT A SELF-MODIFYING AI. That distinction is
 * deliberate and non-negotiable (Derek's call, 2026): a legal-automation
 * system that rewrites its own rules unsupervised is a liability — it could
 * drift away from "I educate, you decide, you win," misrepresent a legal
 * position, or violate a court/ethics rule with nobody having approved the
 * change. So:
 *   - This engine NEVER mutates a rule's status on its own. Ever.
 *   - Every outcome (see OUTCOME_SCORES) updates a rule's SCORE only.
 *   - When a score crosses a lifecycle threshold (see THRESHOLDS), the
 *     engine raises a PENDING SUGGESTION on that rule — "this rule looks
 *     ready to graduate / looks like it should be disabled" — and stops.
 *     Nothing about the rule's pattern, action, or enforcement changes yet.
 *   - A human (Derek) reviews the suggestion and calls approveSuggestion()
 *     or dismissSuggestion(). Only approveSuggestion() ever changes a rule's
 *     actual status. The AI proposes; the human disposes.
 *   - PrimeDox AI's actual system prompt (primedox-ai-backend/main.py) is
 *     not wired to this engine at all and is not mutated by anything here —
 *     it is, and stays, a static string a human edits directly.
 *
 * THE SCORING LOOP, IN PLAIN TERMS:
 *   1. A rule fires (it matched something — a threat, a suggestion, whatever
 *      this instance watches for).
 *   2. Reality tells us if that was good or bad (a "reward signal" — in RL
 *      textbooks this is literally called the reward). We call this an
 *      "outcome."
 *   3. We add the outcome's point value to the rule's running score.
 *   4. If the score crosses a threshold, we flag a pending suggestion for
 *      human review — we do NOT act on it.
 *   5. A human approves or dismisses. Only approval changes the rule's
 *      enforced status. Nothing here evolves unsupervised.
 */

// ── Rule lifecycle states ──────────────────────────────────────────────
// A rule is always in exactly one of these. Read them top to bottom as a
// promotion ladder, with "disabled" as the off-ramp any rule can fall into.
// Every move along this ladder requires a human to call approveSuggestion()
// — see PrimeDoxRuleEngine below. The engine only ever suggests.
export const RULE_STATUS = {
  SANDBOX: 'sandbox',                 // experimental — scored, but not enforced yet
  ACTIVE: 'active',                   // enforced, still earning/losing trust
  CORE: 'core',                       // promoted — the empire's trusted policy
  CORE_UNDER_REVIEW: 'core_under_review', // a core rule regressed badly — flagged for a human, not auto-killed
  DISABLED: 'disabled',               // a human disabled this rule (sustained-failure suggestion, approved)
};

// ── Reward signal table ────────────────────────────────────────────────
// This is the part you tune by hand once, then never touch again — every
// future suggestion flows from these numbers, not from someone's opinion.
//
// Notice false_positive (-2) outweighs blocked_threat (+1). That asymmetry
// is deliberate, not a typo: in a security/legal-automation system, one
// false alarm erodes a user's trust more than one correct, quiet block
// earns it. Reward shaping like this is how you encode "we'd rather miss
// an edge case than annoy a real user" directly into the math, instead of
// hoping every rule author remembers that principle by hand.
export const OUTCOME_SCORES = {
  blocked_threat: 1,      // rule correctly stopped/flagged something bad — small, repeatable reward
  true_negative: 0.1,     // rule correctly stayed silent on something safe — tiny reward, mostly to keep quiet rules from starving
  false_positive: -2,     // rule fired on something safe — costly, on purpose (see comment above)
  missed_threat: -3,      // rule should have fired and didn't — costliest, because silence on a real threat is the worst outcome
};

// ── Lifecycle thresholds ───────────────────────────────────────────────
// Tune these like you'd tune a thermostat: move them, watch what happens
// over the next batch of outcomes, adjust again. Nothing here is sacred.
// Crossing one of these never changes a rule's status by itself — it only
// raises a pendingSuggestion for a human to approve or dismiss.
export const THRESHOLDS = {
  PROMOTE_TO_CORE: 25,          // sustained excellence — suggest active -> core
  DISABLE_FROM_ACTIVE: -10,     // sustained harm — suggest active -> disabled
  SANDBOX_GRADUATE: 10,         // a sandbox experiment earns a real seat — suggest sandbox -> active
  SANDBOX_GRADUATE_MIN_TRIALS: 5, // ...but only after enough outcomes that the score isn't just luck
  SANDBOX_FAIL: -6,             // a sandbox experiment isn't working — suggest sandbox -> disabled
  CORE_REGRESSION_REVIEW: -15, // a core rule's score has fallen this far from its peak — flag a human, don't auto-disable
};

let _uid = 0;
function nextId(prefix) {
  // Deliberately not Date.now()/Math.random() — keeps this engine
  // deterministic and testable. A counter is enough for a rule ID.
  _uid += 1;
  return `${prefix}-${_uid}`;
}

/**
 * In-memory storage adapter — the default. Swap for the localStorage
 * adapter (see end of file) in a browser dashboard, or for a real DB-backed
 * adapter once backend/core/db.py is reachable. The engine itself never
 * imports a UI or a database — that's what keeps the same class reusable
 * as "Timmy" in one file and "PrimeDox AI" in another.
 */
class MemoryStorage {
  constructor() { this._rules = new Map(); }
  load() { return Array.from(this._rules.values()); }
  save(rules) {
    this._rules.clear();
    for (const rule of rules) this._rules.set(rule.id, rule);
  }
}

export class PrimeDoxRuleEngine {
  /**
   * @param {string} name   - the brand wearing PrimeDox today ("Timmy", "PrimeDox AI", ...)
   * @param {string} domain - what this instance's rules are about (free text, for the UI/logs)
   * @param {object} opts   - { storage, onNeedsReview }
   *   storage      - a storage adapter (defaults to in-memory)
   *   onNeedsReview - optional callback(rule, reason) fired whenever a rule
   *                   gets a new pending suggestion or a core rule is flagged
   *                   for review. This is a HOOK ONLY — it does not send a
   *                   text/call/email. Wiring an actual notification channel
   *                   (Twilio SMS, a phone call, SendGrid email) needs real
   *                   infra credentials Claude does not hold; that's a Manus
   *                   build task, not something this file can do on its own.
   *                   Until that's wired up, the in-page toast is the only
   *                   "notification" Derek gets — he has to be looking at
   *                   the dashboard to see it.
   */
  constructor(name, domain, opts = {}) {
    this.name = name;
    this.domain = domain;
    this.storage = opts.storage || new MemoryStorage();
    this.onNeedsReview = opts.onNeedsReview || (() => {});
    this.rules = new Map(this.storage.load().map((r) => [r.id, r]));
  }

  _persist() {
    this.storage.save(Array.from(this.rules.values()));
  }

  /**
   * Pattern detection step — Timmy/PrimeDox notices a recurring signal that
   * no existing rule covers, and proposes a brand new rule to test. It is
   * born in SANDBOX: scored on every future outcome exactly like a real
   * rule, but never enforced until a human graduates it. This is
   * "exploration" in RL terms — trying new behavior without betting the
   * whole system on it, and without the system betting on itself either.
   */
  proposeCandidateRule({ description, pattern, action }) {
    const rule = {
      id: nextId('rule'),
      description,
      pattern,
      action,
      status: RULE_STATUS.SANDBOX,
      score: 0,
      peakScore: 0,
      trials: 0,
      history: [],
      pendingSuggestion: null,
      createdAt: this.rules.size, // ordinal "time" — avoids Date.now() (see note above)
    };
    this.rules.set(rule.id, rule);
    this._persist();
    return rule;
  }

  /** Manually seed a rule straight into ACTIVE — for rules you already trust on day one. */
  addActiveRule({ description, pattern, action }) {
    const rule = {
      id: nextId('rule'),
      description,
      pattern,
      action,
      status: RULE_STATUS.ACTIVE,
      score: 0,
      peakScore: 0,
      trials: 0,
      history: [],
      pendingSuggestion: null,
      createdAt: this.rules.size,
    };
    this.rules.set(rule.id, rule);
    this._persist();
    return rule;
  }

  /**
   * The heart of the controller. Call this every time a rule fires and you
   * find out, later, whether it was right.
   *   engine.recordOutcome(ruleId, 'blocked_threat', 'caught a credential-stuffing burst')
   * This updates the score and may raise a pendingSuggestion — it never
   * changes rule.status by itself. Returns the updated rule AND whatever
   * suggestion was raised (or null) so a UI can show "needs your review."
   */
  recordOutcome(ruleId, outcomeType, note = '') {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`No such rule: ${ruleId}`);
    if (!(outcomeType in OUTCOME_SCORES)) {
      throw new Error(`Unknown outcome type: ${outcomeType}. Add it to OUTCOME_SCORES first.`);
    }

    const delta = OUTCOME_SCORES[outcomeType];
    rule.score += delta;
    rule.trials += 1;
    rule.peakScore = Math.max(rule.peakScore, rule.score);
    rule.history.push({ outcomeType, delta, note, scoreAfter: rule.score });

    const suggestion = this._evaluateForSuggestion(rule);
    this._persist();
    return { rule, suggestion };
  }

  /**
   * Checks the score against thresholds and, if one is crossed, raises a
   * pendingSuggestion — it does NOT change rule.status. The only exception
   * is the core-regression flag, which is purely informational (it doesn't
   * change enforcement, just marks the rule for a human's attention) and
   * mirrors the existing reaffirm/retire safety valve below.
   */
  _evaluateForSuggestion(rule) {
    switch (rule.status) {
      case RULE_STATUS.SANDBOX: {
        if (rule.score <= THRESHOLDS.SANDBOX_FAIL) {
          rule.pendingSuggestion = 'sandbox_failed';
          this.onNeedsReview(rule, rule.pendingSuggestion);
          return rule.pendingSuggestion;
        }
        if (rule.score >= THRESHOLDS.SANDBOX_GRADUATE &&
            rule.trials >= THRESHOLDS.SANDBOX_GRADUATE_MIN_TRIALS) {
          rule.pendingSuggestion = 'graduated_to_active';
          this.onNeedsReview(rule, rule.pendingSuggestion);
          return rule.pendingSuggestion;
        }
        rule.pendingSuggestion = null;
        return null;
      }

      case RULE_STATUS.ACTIVE: {
        if (rule.score <= THRESHOLDS.DISABLE_FROM_ACTIVE) {
          rule.pendingSuggestion = 'auto_disabled';
          this.onNeedsReview(rule, rule.pendingSuggestion);
          return rule.pendingSuggestion;
        }
        if (rule.score >= THRESHOLDS.PROMOTE_TO_CORE) {
          rule.pendingSuggestion = 'promoted_to_core';
          this.onNeedsReview(rule, rule.pendingSuggestion);
          return rule.pendingSuggestion;
        }
        rule.pendingSuggestion = null;
        return null;
      }

      case RULE_STATUS.CORE: {
        // Deliberate asymmetry: core rules are never auto-disabled or
        // auto-anything. A rule that earned full trust doesn't lose it on
        // the algorithm's say-so — it gets flagged for a human to look at.
        // This status change itself doesn't alter enforcement; it's a
        // review flag, resolved only by reaffirmCoreRule/retireCoreRule.
        if (rule.peakScore - rule.score >= THRESHOLDS.CORE_REGRESSION_REVIEW) {
          rule.status = RULE_STATUS.CORE_UNDER_REVIEW;
          this.onNeedsReview(rule, 'flagged_for_review');
          return 'flagged_for_review';
        }
        return null;
      }

      case RULE_STATUS.CORE_UNDER_REVIEW:
      case RULE_STATUS.DISABLED:
      default:
        return null; // terminal-ish states; a human decides what happens next
    }
  }

  /**
   * Human approval: Derek confirms a pending lifecycle suggestion should
   * actually happen. This is the ONLY method in this file that changes a
   * rule's enforced status as a result of scoring — and it only runs when
   * a human calls it.
   */
  approveSuggestion(ruleId) {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`No such rule: ${ruleId}`);
    const suggestion = rule.pendingSuggestion;
    if (!suggestion) return { rule, transition: null };

    const STATUS_BY_SUGGESTION = {
      graduated_to_active: RULE_STATUS.ACTIVE,
      promoted_to_core: RULE_STATUS.CORE,
      auto_disabled: RULE_STATUS.DISABLED,
      sandbox_failed: RULE_STATUS.DISABLED,
    };
    rule.status = STATUS_BY_SUGGESTION[suggestion] || rule.status;
    rule.pendingSuggestion = null;
    this._persist();
    return { rule, transition: suggestion };
  }

  /** Human override: Derek dismisses a pending suggestion — rule keeps its current status, nothing changes. */
  dismissSuggestion(ruleId) {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`No such rule: ${ruleId}`);
    rule.pendingSuggestion = null;
    this._persist();
    return rule;
  }

  /** Human override: confirm a reviewed core rule is still good. */
  reaffirmCoreRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`No such rule: ${ruleId}`);
    rule.status = RULE_STATUS.CORE;
    rule.peakScore = rule.score; // reset the regression baseline
    this._persist();
    return rule;
  }

  /** Human override: a reviewed core rule really has gone bad — retire it. */
  retireCoreRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`No such rule: ${ruleId}`);
    rule.status = RULE_STATUS.DISABLED;
    this._persist();
    return rule;
  }

  /** Ranked leaderboard, grouped by lifecycle state and pending-approval status, for the UI. */
  leaderboard() {
    const all = Array.from(this.rules.values()).sort((a, b) => b.score - a.score);
    return {
      core: all.filter((r) => r.status === RULE_STATUS.CORE),
      coreUnderReview: all.filter((r) => r.status === RULE_STATUS.CORE_UNDER_REVIEW),
      active: all.filter((r) => r.status === RULE_STATUS.ACTIVE),
      sandbox: all.filter((r) => r.status === RULE_STATUS.SANDBOX),
      disabled: all.filter((r) => r.status === RULE_STATUS.DISABLED),
      pendingApproval: all.filter((r) => r.pendingSuggestion),
      ranked: all, // everything, one list, for a single top-to-bottom leaderboard view
    };
  }
}

/**
 * Browser persistence adapter. Same engine, just remembers rules across
 * page reloads via localStorage instead of RAM. Pass a unique storageKey
 * per named instance (e.g. "timmy_rules", "primedox_rules") so different
 * brands wearing this same engine don't overwrite each other's policy.
 */
export class LocalStorageAdapter {
  constructor(storageKey) { this.key = storageKey; }
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  save(rules) {
    localStorage.setItem(this.key, JSON.stringify(rules));
  }
}
