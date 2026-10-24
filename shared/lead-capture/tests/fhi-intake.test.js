"use strict";
/*
 * Tests for fhi-intake.js — the lead intake client.
 *
 * The property under test throughout: the module must never report success
 * it cannot observe. Every test that asserts a NON-'received' status is
 * guarding against the failure mode the current site already has — a visitor
 * being told their enquiry went through when it did not.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const MODULE = path.resolve(__dirname, "../fhi-intake.js");
function load() { delete require.cache[MODULE]; return require(MODULE); }

const GOOD = {
  name: "Jane Okafor",
  email: "jane@example.com",
  organisation: "Okafor Logistics",
  need: "We spend two days a month reconciling driver paperwork by hand."
};
// A submission 30s after the form opened, i.e. a plausible human.
const HUMAN = { now: 1_700_000_030_000, openedAt: 1_700_000_000_000 };
const fakeFetch = (status) => async () => ({ status });

/* ── validation ─────────────────────────────────────────────────────────── */
test("a complete submission validates", () => {
  const r = load().validate(GOOD);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test("each required field is actually required", () => {
  const I = load();
  for (const f of I.FIELDS.required) {
    const data = { ...GOOD }; delete data[f];
    const r = I.validate(data);
    assert.equal(r.ok, false, `${f} should be required`);
    assert.equal(r.errors[f], "required");
  }
});

test("whitespace does not satisfy a required field", () => {
  const r = load().validate({ ...GOOD, name: "   \t " });
  assert.equal(r.ok, false);
  assert.equal(r.errors.name, "required");
});

test("an obviously malformed email is rejected, and real-world ones are not", () => {
  const I = load();
  for (const bad of ["jane", "jane@", "@example.com", "jane example.com", "jane@example"]) {
    assert.equal(I.validate({ ...GOOD, email: bad }).ok, false, `${bad} should fail`);
  }
  // Addresses a stricter regex would wrongly reject. Losing a real lead is worse
  // than accepting one the endpoint will bounce.
  for (const ok of ["jane+fhi@example.com", "j.o'brien@sub.example.co.uk",
                    "jane_okafor@example-corp.ca", "JANE@EXAMPLE.COM"]) {
    assert.equal(I.validate({ ...GOOD, email: ok }).ok, true, `${ok} should pass`);
  }
});

/* ── spam controls ──────────────────────────────────────────────────────── */
test("a filled honeypot is treated as spam", () => {
  const r = load().spamCheck({ ...GOOD, _confirm_human: "x" }, HUMAN.openedAt, HUMAN.now);
  assert.equal(r.spam, true);
});

test("an instant submission is treated as spam, a considered one is not", () => {
  const I = load();
  assert.equal(I.spamCheck(GOOD, 1_700_000_000_000, 1_700_000_000_500).spam, true, "0.5s");
  assert.equal(I.spamCheck(GOOD, HUMAN.openedAt, HUMAN.now).spam, false, "30s");
});

/* ── field allow-list ───────────────────────────────────────────────────── */
test("fields outside the allow-list are stripped before sending", () => {
  const out = load().sanitise({
    ...GOOD, is_admin: "true", role: "owner", sin: "123456789", __proto__: { x: 1 }
  });
  for (const k of ["is_admin", "role", "sin"]) {
    assert.equal(Object.hasOwn(out, k), false, `${k} must not be forwarded`);
  }
  assert.equal(out.name, GOOD.name);
});

test("over-long input is truncated, not rejected outright", () => {
  const out = load().sanitise({ ...GOOD, need: "x".repeat(99_999) });
  assert.ok(out.need.length <= 4000, `got ${out.need.length}`);
});

/* ── the core property: no unobserved success ───────────────────────────── */
test("with no endpoint configured, nothing is sent and the status says so", async () => {
  const I = load();                                   // ENDPOINT defaults to ''
  let called = false;
  const r = await I.submit(GOOD, { ...HUMAN, fetch: async () => { called = true; return { status: 200 }; } });
  assert.equal(r.status, "not_configured");
  assert.equal(called, false, "fetch must not be called when unconfigured");
  assert.match(I.messageFor(r.status), /NOT sent/);
});

test("a 2xx from the endpoint is the only thing that yields 'received'", async () => {
  for (const status of [200, 201, 202, 204]) {
    const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc" });
    const r = await I.submit(GOOD, { ...HUMAN, fetch: fakeFetch(status) });
    assert.equal(r.status, "received", `HTTP ${status}`);
  }
});

test("a 4xx is 'rejected' and never reported as received", async () => {
  for (const status of [400, 403, 404, 422, 429]) {
    const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc" });
    const r = await I.submit(GOOD, { ...HUMAN, fetch: fakeFetch(status) });
    assert.equal(r.status, "rejected", `HTTP ${status}`);
    assert.notEqual(r.status, "received");
  }
});

test("a 5xx is 'unavailable' and the visitor is told it was NOT recorded", async () => {
  for (const status of [500, 502, 503]) {
    const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc" });
    const r = await I.submit(GOOD, { ...HUMAN, fetch: fakeFetch(status) });
    assert.equal(r.status, "unavailable", `HTTP ${status}`);
    assert.match(I.messageFor(r.status), /NOT been recorded/);
  }
});

test("a network failure is 'unavailable', not a silent success", async () => {
  const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc" });
  const r = await I.submit(GOOD, {
    ...HUMAN, fetch: async () => { throw new TypeError("Failed to fetch"); }
  });
  assert.equal(r.status, "unavailable");
});

test("a timeout is 'unavailable', not a silent success", async () => {
  const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc", TIMEOUT_MS: 20 });
  const r = await I.submit(GOOD, {
    ...HUMAN, fetch: (url, o) => new Promise((_, rej) =>
      o.signal.addEventListener("abort", () => { const e = new Error("aborted"); e.name = "AbortError"; rej(e); }))
  });
  assert.equal(r.status, "unavailable");
  assert.equal(r.detail, "timed out");
});

test("an invalid submission is not sent at all", async () => {
  const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc" });
  let called = false;
  const r = await I.submit({ ...GOOD, email: "nope" }, {
    ...HUMAN, fetch: async () => { called = true; return { status: 200 }; }
  });
  assert.equal(r.status, "invalid");
  assert.equal(called, false, "fetch must not be called on invalid input");
});

test("a spam submission is not sent at all", async () => {
  const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc" });
  let called = false;
  const r = await I.submit({ ...GOOD, _confirm_human: "bot" }, {
    ...HUMAN, fetch: async () => { called = true; return { status: 200 }; }
  });
  assert.equal(r.status, "discarded");
  assert.equal(called, false);
});

/* ── no secrets, no overclaiming ────────────────────────────────────────── */
test("the module source contains no credential-shaped literal", () => {
  const src = require("node:fs").readFileSync(MODULE, "utf8");
  for (const re of [/sk_live/, /sk_test/, /AIza[0-9A-Za-z_-]{20,}/, /xox[baprs]-/,
                    /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
                    /Bearer\s+[A-Za-z0-9_\-.]{20,}/]) {
    assert.equal(re.test(src), false, `source matches ${re}`);
  }
});

test("no visitor-facing message claims an email was sent", () => {
  const I = load();
  for (const [status, msg] of Object.entries(I.MESSAGES)) {
    assert.equal(/email (has been|was) sent|we have emailed|message sent/i.test(msg), false,
      `${status}: "${msg}"`);
  }
  // Only the observed-success message may be reassuring.
  assert.match(I.MESSAGES.received, /received/i);
});

test("the payload carries a submission timestamp and intake label", async () => {
  const I = load(); I.config({ ENDPOINT: "https://example.test/f/abc" });
  let body;
  await I.submit(GOOD, { ...HUMAN, fetch: async (u, o) => { body = JSON.parse(o.body); return { status: 200 }; } });
  assert.equal(body._intake, "FHI diagnostic intake");
  assert.equal(body._submitted_at, new Date(HUMAN.now).toISOString());
  assert.equal(Object.hasOwn(body, "_confirm_human"), false, "honeypot must not be forwarded");
});
