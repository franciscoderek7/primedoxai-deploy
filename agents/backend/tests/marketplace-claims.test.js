"use strict";
/*
 * marketplace-claims.test.js
 *
 * Guards the correction made on 2026-10-24. The marketplace catalogue carried
 * `verified: true` as a hard-coded literal on all ten listings, plus `kpis`
 * blocks of unevidenced outcome figures. Both are customer-facing: `verified`
 * renders as a "VERIFIED" badge in admin-dashboard/index.html:574 and the whole
 * agent object is echoed by the API via res.json({ ...agent, reviews }).
 *
 * These tests exist so the next person to touch the catalogue cannot
 * reintroduce an unmeasured claim without a test going red.
 *
 * Offline: the source is parsed, no server and no network.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SRC = path.resolve(__dirname, "../marketplace.js");
const src = fs.readFileSync(SRC, "utf8");
// Comments carry the explanation of WHY these fields are false/empty and
// legitimately quote the old values, so exclude them from the assertions.
const code = src.split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");

// Scope the catalogue assertions to the BUILT_IN_AGENTS array. Elsewhere in the
// file, POST /api/marketplace/submit also sets verified:false (correctly — a
// newly submitted agent is pending_review), and counting that as a catalogue
// listing is what made the first version of this test fail.
const start = code.indexOf("const BUILT_IN_AGENTS = [");
const end = code.indexOf("\n];", start);
if (start === -1 || end === -1) throw new Error("could not locate BUILT_IN_AGENTS");
const catalogue = code.slice(start, end);

test("no listing claims to be verified", () => {
  const hits = catalogue.match(/verified:\s*true/g) || [];
  assert.equal(hits.length, 0,
    `${hits.length} listing(s) still claim verified: true. A listing may only ` +
    `be marked verified once a named human has reviewed it and recorded how.`);
});

test("every listing carries an explicit verified: false", () => {
  const listings = (catalogue.match(/^\s{4}id:\s*'/gm) || []).length;
  const flags = (catalogue.match(/verified:\s*false/g) || []).length;
  assert.ok(listings > 0, "expected to find listings to check");
  assert.equal(flags, listings,
    `${listings} listings but ${flags} verified:false flags — a listing with ` +
    `no flag at all would render as PENDING by accident rather than by intent`);
});

test("no kpis value states a percentage, a dollar figure or a duration", () => {
  const blocks = catalogue.match(/kpis:\s*\{[^}]*\}/g) || [];
  assert.ok(blocks.length > 0, "expected kpis blocks to check");
  for (const b of blocks) {
    assert.equal(/\d/.test(b), false,
      `unevidenced KPI figure reintroduced: ${b}\n` +
      `A KPI needs a measured value AND a sibling 'source' field naming where ` +
      `it was measured. If it was not measured, it does not belong here.`);
  }
});

test("the kpis key is retained, because callers read it", () => {
  // integration.test.js:361 asserts the field exists on the single-agent
  // response. Deleting the key would break that contract; emptying it does not.
  const blocks = catalogue.match(/kpis:\s*\{[^}]*\}/g) || [];
  const listings = (catalogue.match(/^\s{4}id:\s*'/gm) || []).length;
  assert.equal(blocks.length, listings,
    `every listing must keep a kpis key (even empty): ${listings} listings, ` +
    `${blocks.length} kpis keys`);
});

test("the explanation survives in the source", () => {
  // If someone strips the comment, the next person has no idea why these are
  // empty and will helpfully repopulate them.
  assert.match(src, /Do not repopulate either field with an estimate/,
    "the note explaining why verified/kpis are false/empty has been removed");
});

test("the creator-submission flow still defaults new agents to unverified", () => {
  // Pre-existing correct behaviour, outside the catalogue: a newly submitted
  // agent must not arrive verified. Asserted so a future edit cannot flip it.
  const submit = code.slice(code.indexOf("/api/marketplace/submit"));
  assert.match(submit, /status:\s*'pending_review'/);
  assert.match(submit, /verified:\s*false/);
});
