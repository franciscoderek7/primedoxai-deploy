"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const MODULE = path.resolve(__dirname, "../fhi-funnel.js");
function load() { delete require.cache[MODULE]; return require(MODULE); }

test("the funnel stages are ordered and not collapsible", () => {
  const F = load();
  assert.deepEqual(F.STAGES, ["visit","cta_view","cta_click","form_start",
    "lead_submitted","lead_qualified","payment_initiated","revenue_collected"]);
  assert.ok(F.STAGES.indexOf("cta_click") < F.STAGES.indexOf("lead_submitted"));
  assert.ok(F.STAGES.indexOf("lead_submitted") < F.STAGES.indexOf("revenue_collected"));
  assert.ok(F.STAGES.indexOf("payment_initiated") < F.STAGES.indexOf("revenue_collected"));
});

test("an unknown stage is refused", () => {
  assert.equal(load().track("conversion", {}).recorded, false);
});

test("revenue cannot be attached to a click, a lead, or an initiated payment", () => {
  const F = load();
  for (const stage of ["cta_click", "lead_submitted", "lead_qualified", "payment_initiated"]) {
    const r = F.track(stage, { amount_cad: 249 });
    assert.equal(r.recorded, false, `${stage} must not carry revenue`);
    assert.match(r.reason, /only valid on revenue_collected/);
  }
});

test("revenue_collected demands a positive amount AND proof of collection", () => {
  const F = load();
  assert.equal(F.track("revenue_collected", {}).recorded, false);
  assert.equal(F.track("revenue_collected", { amount_cad: 249 }).recorded, false, "needs confirmation_ref");
  assert.equal(F.track("revenue_collected", { amount_cad: 0, confirmation_ref: "x" }).recorded, false);
  assert.equal(F.track("revenue_collected", { amount_cad: "249", confirmation_ref: "x" }).recorded, false);
  assert.equal(F.track("revenue_collected", { amount_cad: 249, confirmation_ref: "pp-12345" }).recorded, true);
});

test("personal information never reaches an event", () => {
  const F = load();
  const r = F.track("lead_submitted", {
    name: "Jane Okafor", email: "jane@example.com", phone: "705-555-0100",
    organisation: "Okafor Logistics", need: "manual paperwork",
    lead_id: "lead_abc", utm_source: "linkedin"
  });
  assert.equal(r.recorded, true);
  for (const k of F.PII) assert.equal(Object.hasOwn(r.event.props, k), false, `${k} leaked`);
  assert.equal(r.event.props.lead_id, "lead_abc", "non-identifying id is kept");
  assert.equal(r.event.props.utm_source, "linkedin");
  assert.equal(r.event.props._dropped_pii_fields, 5);
});

test("a stray email-shaped value in any field is dropped", () => {
  const r = load().track("visit", { note: "contact me at jane@example.com" });
  assert.equal(Object.hasOwn(r.event.props, "note"), false);
});

test("attribution reads the URL only, with no cookie and no cross-site id", () => {
  const F = load();
  const a = F.attribution("?utm_source=linkedin&utm_campaign=diag-oct&other=x");
  assert.equal(a.utm_source, "linkedin");
  assert.equal(a.utm_campaign, "diag-oct");
  assert.equal(Object.hasOwn(a, "other"), false);
  const b = F.attribution("", "https://news.ycombinator.com/item?id=1");
  assert.equal(b.referrer_host, "news.ycombinator.com");
  assert.deepEqual(F.attribution(""), {});
});

test("a lead id is random, not derived from personal detail", () => {
  const F = load();
  const ids = new Set(Array.from({ length: 200 }, () => F.newLeadId()));
  assert.equal(ids.size, 200, "ids must not collide");
  for (const id of ids) assert.equal(/@|jane|okafor/i.test(id), false);
});

test("status reports configured and verified separately, and never claims active", () => {
  const F = load();
  let s = F.status();
  assert.equal(s.configured, false);
  assert.equal(s.delivery_verified, false);
  F.config({ PROVIDER: "ga4", MEASUREMENT_ID: "G-TEST12345" });
  s = F.status();
  assert.equal(s.configured, true, "now configured");
  assert.equal(s.delivery_verified, false, "configured is NOT verified");
  assert.match(s.note, /No analytics provider is wired|not reportable/);
});

test("recorded does not mean delivered", () => {
  const r = load().track("visit", {});
  assert.equal(r.recorded, true);
  assert.equal(r.delivered, false, "nothing is delivered until a provider is wired");
});
