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
 * is a costume. The reinforcement-learning loop underneath never changes.
 * That's the instruction this file follows literally: "will wear many
 * names... but will always be PrimeDox."
 *
 * THE RL LOOP, IN PLAIN TERMS:
 *   1. A rule fires (it matched something — a threat, a suggestion, whatever
 *      this instance watches for).
 *   2. Reality tells us if that was good or bad (a "reward signal" — in RL
 *      textbooks this is literally called the reward). We call this an
 *      "outcome."
 *   3. We add the outcome's point value to the rule's running score.
 *   4. We check the score against thresholds and move the rule between four
 *      lifecycle states: sandbox -> active -> core, or any of them -> disabled.
 *   5. Over many rules and many outcomes, the system's overall behavior
 *      drifts toward whatever scored well and away from whatever scored
 *      badly — that drift IS the "self-optimization." Nobody hand-edited a
 *      rule; the scoreboard did it.
 *
 * That's the entire trick behind "reinforcement learning controllers" in
 * production systems (it's the same shape as a multi-armed bandit, just
 * with named arms instead of numbered ones). No neural network required.
 */

// ── Rule lifecycle states ──────────────────────────────────────────────
// A rule is always in exactly one of these. Read them top to bottom as a
// promotion ladder, with "disabled" as the off-ramp any rule can fall into.
export const RULE_STATUS = {
  SANDBOX: 'sandbox',                 // experimental — scored, but not enforced yet
  ACTIVE: 'active',                   // enforced, still earning/losing trust
  CORE: 'core',                       // promoted — the empire's trusted policy
  CORE_UNDER_REVIEW: 'core_under_review', // a core rule regressed badly — flagged for a human, not auto-killed
  DISABLED: 'disabled',               // scored itself out of the system
};

// ── Reward signal table ────────────────────────────────────────────────
// This is the part you tune by hand once, then never touch again — every
// future decision flows from these numbers, not from someone's opinion.
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
export const THRESHOLDS = {
  PROMOTE_TO_CORE: 25,          // sustained excellence — graduate active -> core
  DISABLE_FROM_ACTIVE: -10,     // sustained harm — active -> disabled, automatically
  SANDBOX_GRADUATE: 10,         // a sandbox experiment earns a real seat — sandbox -> active
  SANDBOX_GRADUATE_MIN_TRIALS: 5, // ...but only after enough outcomes that the score isn't just luck
  SANDBOX_FAIL: -6,             // a sandbox experiment isn't working — sandbox -> disabled, never went live
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
   * @param {object} opts   - { storage } a storage adapter (defaults to in-memory)
   */
  constructor(name, domain, opts = {}) {
    this.name = name;
    this.domain = domain;
    this.storage = opts.storage || new MemoryStorage();
    this.rules = new Map(this.storage.load().map((r) => [r.id, r]));
  }

  _persist() {
    this.storage.save(Array.from(this.rules.values()));
  }

  /**
   * Pattern detection step (#4 in the spec) — Timmy/PrimeDox notices a
   * recurring signal that no existing rule covers, and proposes a brand
   * new rule to test. It is born in SANDBOX: scored on every future
   * outcome exactly like a real rule, but never enforced until it proves
   * itself. This is "exploration" in RL terms — trying new behavior
   * without betting the whole system on it.
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
      createdAt: this.rules.size,
    };
    this.rules.set(rule.id, rule);
    this._persist();
    return rule;
  }

  /**
   * The heart of the controller (#1 in the spec). Call this every time a
   * rule fires and you find out, later, whether it was right.
   *   engine.recordOutcome(ruleId, 'blocked_threat', 'caught a credential-stuffing burst')
   * Returns the updated rule AND whatever lifecycle transition happened
   * (or null if nothing changed) so a UI can show "promoted!" / "disabled."
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

    const transition = this._reevaluate(rule);
    this._persist();
    return { rule, transition };
  }

  /**
   * Steps #2 and #3 of the spec, in one place: low-scoring rules get
   * auto-disabled, high-scoring rules get promoted to core policy. This
   * runs after every single outcome — there's no separate "training job"
   * to schedule, the policy updates itself in real time as evidence comes in.
   */
  _reevaluate(rule) {
    switch (rule.status) {
      case RULE_STATUS.SANDBOX: {
        if (rule.score <= THRESHOLDS.SANDBOX_FAIL) {
          rule.status = RULE_STATUS.DISABLED;
          return 'sandbox_failed';
        }
        if (rule.score >= THRESHOLDS.SANDBOX_GRADUATE &&
            rule.trials >= THRESHOLDS.SANDBOX_GRADUATE_MIN_TRIALS) {
          rule.status = RULE_STATUS.ACTIVE;
          return 'graduated_to_active';
        }
        return null;
      }

      case RULE_STATUS.ACTIVE: {
        if (rule.score <= THRESHOLDS.DISABLE_FROM_ACTIVE) {
          rule.status = RULE_STATUS.DISABLED;
          return 'auto_disabled';
        }
        if (rule.score >= THRESHOLDS.PROMOTE_TO_CORE) {
          rule.status = RULE_STATUS.CORE;
          return 'promoted_to_core';
        }
        return null;
      }

      case RULE_STATUS.CORE: {
        // Deliberate asymmetry: core rules are NOT auto-disabled the way
        // active rules are. A rule that earned the empire's full trust
        // doesn't lose it on the algorithm's say-so alone — it gets
        // flagged for a human to look at. This is the safety valve: full
        // self-modification for sandbox/active, a manual checkpoint for
        // anything already promoted to policy.
        if (rule.peakScore - rule.score >= THRESHOLDS.CORE_REGRESSION_REVIEW) {
          rule.status = RULE_STATUS.CORE_UNDER_REVIEW;
          return 'flagged_for_review';
        }
        return null;
      }

      case RULE_STATUS.CORE_UNDER_REVIEW:
      case RULE_STATUS.DISABLED:
      default:
        return null; // terminal-ish states; a human (see methods below) decides what happens next
    }
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

  /** #5 in the spec — ranked leaderboard, grouped by lifecycle state for the UI. */
  leaderboard() {
    const all = Array.from(this.rules.values()).sort((a, b) => b.score - a.score);
    return {
      core: all.filter((r) => r.status === RULE_STATUS.CORE),
      coreUnderReview: all.filter((r) => r.status === RULE_STATUS.CORE_UNDER_REVIEW),
      active: all.filter((r) => r.status === RULE_STATUS.ACTIVE),
      sandbox: all.filter((r) => r.status === RULE_STATUS.SANDBOX),
      disabled: all.filter((r) => r.status === RULE_STATUS.DISABLED),
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
