/**
 * Gap-scanner regression suite.
 *
 * Covers the three-edit fix to loadProfiles() / the scanUrl lookup / the
 * /api/gap-scan/industries mapping.
 *
 * THE ORIGINAL DEFECTS
 *   1. loadProfiles() returned the whole { _meta, industries } wrapper, so
 *      `profiles.find(...)` threw TypeError: profiles.find is not a function
 *      on EVERY scan, and `profiles.map(...)` broke the industries endpoint.
 *   2. The lookup compared the DISPLAY LABEL (p.industry === "Dental")
 *      against what detectIndustry() returns, which is the object KEY
 *      ("dental"). All 20 keys differ from their label, so converting the
 *      shape alone would silently yield profile === null for every scan —
 *      a quieter failure than the crash.
 *
 * Dependency-free: node --test only. No network (a loopback fixture server
 * is used), no credential, no service, no external call.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { scanUrl } = require('../gap-scanner.js');
const RAW = require('../industry-profiles.json');
const SCANNER_SRC = fs.readFileSync(path.join(__dirname, '..', 'gap-scanner.js'), 'utf8');

const ID_FORMAT = /^[a-z][a-z0-9_]*$/;

// ── fixtures, written inline so the suite needs no external files ────────

const DENTAL_HTML = `<!doctype html><html><head><meta charset="utf-8">
<title>Lakeview Dental — Orthodontics and Invisalign</title></head><body>
<h1>Lakeview Dental Clinic</h1>
<p>Our dentists provide dental cleanings, teeth whitening, Invisalign and
braces. Periodont and oral surgery referrals available.</p>
<form action="/contact" method="post"><input name="email"><button>Send</button></form>
</body></html>`;

const TRADE_HTML = (terms) => `<!doctype html><html><head><meta charset="utf-8">
<title>Trade Services</title></head><body><p>${terms}</p></body></html>`;

// Term sets chosen to match INDUSTRY_SIGNALS for the four unprofiled trades.
const TRADES = {
  automotive_repair: 'auto repair mechanic oil change brake service',
  plumbing:          'plumber plumbing drain pipe repair water heater',
  hvac:              'hvac heating cooling furnace air condition heat pump',
  // NB: "contractor" is claimed by construction_roofing's pattern as well,
  // so it is deliberately omitted here — see the limitation noted in the
  // report. These terms are unambiguous for each trade.
  electrical:        'electrician electrical panel upgrade wiring',
};

function serve(html) {
  const srv = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  return new Promise((resolve) => {
    srv.listen(0, '127.0.0.1', () => resolve({
      url: `http://127.0.0.1:${srv.address().port}/`,
      close: () => new Promise((r) => srv.close(r)),
    }));
  });
}

async function scan(html, options) {
  const s = await serve(html);
  try { return await scanUrl(s.url, options); } finally { await s.close(); }
}

// loadProfiles() is module-private and intentionally stays that way — the
// approved change was three edits, and exporting it would be a fourth.
// Reproduce exactly what it now returns, from the same data file, so the
// shape can be asserted; the source assertions below pin the real code to
// this same rule so the two cannot drift apart.
const profilesAsLoaded = () => Object.entries(RAW.industries).map(([id, p]) => ({ ...p, id }));

// Mirrors the /api/gap-scan/industries handler without starting express.
const endpointShape = () => profilesAsLoaded().map((p) => ({
  id: p.id, group: p.group, industry: p.industry, sub_industries: p.sub_industries,
}));

// Source with comments stripped — for assertions about what the code DOES,
// not what its comments mention.
const CODE_ONLY = SCANNER_SRC
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');

// ── loadProfiles() shape and the canonical id ────────────────────────────

test('01 loadProfiles returns an array of all 20 profiles', () => {
  const profiles = profilesAsLoaded();
  assert.ok(Array.isArray(profiles), 'must be an array — the original returned an object');
  assert.equal(profiles.length, Object.keys(RAW.industries).length);
  assert.equal(profiles.length, 20);
  assert.equal(typeof profiles.find, 'function');
  assert.equal(typeof profiles.map, 'function');
  // pin the real implementation to the same enumeration
  assert.match(CODE_ONLY, /Object\.entries\(industryProfiles\.industries\)/,
    'loadProfiles must enumerate .industries, not return the wrapper');
});

test('02 M4 no profile in the data file carries its own id property', () => {
  // If one ever does, the { ...p, id } spread order is what keeps the
  // canonical id authoritative. This test guards the data side of that.
  const offenders = Object.entries(RAW.industries)
    .filter(([, p]) => Object.prototype.hasOwnProperty.call(p, 'id'))
    .map(([k]) => k);
  assert.deepEqual(offenders, [], `profiles with an own id: ${offenders}`);
});

test('03 every profile exposes a canonical id in key format', () => {
  for (const p of profilesAsLoaded()) {
    assert.match(p.id, ID_FORMAT, `id ${JSON.stringify(p.id)} is not a canonical key`);
  }
});

test('04 the canonical ids are exactly the object keys', () => {
  assert.deepEqual(profilesAsLoaded().map((p) => p.id).sort(), Object.keys(RAW.industries).sort());
});

test('05 M5 every profile retains a non-empty human-readable label', () => {
  for (const p of profilesAsLoaded()) {
    assert.equal(typeof p.industry, 'string');
    assert.ok(p.industry.trim().length > 0, `${p.id} has no display label`);
  }
});

test('06 id and label are genuinely distinct for all 20 — the root of defect 2', () => {
  const same = profilesAsLoaded().filter((p) => p.id === p.industry);
  assert.deepEqual(same.map((p) => p.id), [], 'if these matched, the original lookup would have worked');
});

test('07 M1 the dental profile is present under the exact canonical id "dental"', () => {
  const dental = profilesAsLoaded().find((p) => p.id === 'dental');
  assert.ok(dental, 'dental must be findable by canonical id');
  assert.equal(dental.id, 'dental');
  assert.equal(dental.industry, 'Dental');
  assert.equal(typeof dental.benchmarks.has_online_booking, 'number');
});

test('08 the canonical id cannot be overwritten by a profile property', () => {
  // Reproduce the spread against a synthetic profile that carries a
  // conflicting id, and assert the injected key wins.
  const synthetic = { id: 'HIJACKED', industry: 'Synthetic' };
  const correct = { ...synthetic, id: 'real_key' };   // id last — the fix
  const fragile = { id: 'real_key', ...synthetic };   // id first — the trap
  assert.equal(correct.id, 'real_key', 'id spread last must win');
  assert.equal(fragile.id, 'HIJACKED', 'id spread first is overwritten — do not use this order');
  assert.match(
    SCANNER_SRC, /\.map\(\(\[id, p\]\) => \(\{ \.\.\.p, id \}\)\)/,
    'loadProfiles must spread the profile first and the id last',
  );
});

test('09 M6 the scanner reads no field from _meta', () => {
  // Check executable code only. A comment may legitimately describe the
  // JSON's shape; what matters is that nothing READS from _meta.
  assert.doesNotMatch(CODE_ONLY, /_meta\s*[.\[]/, 'the scanner must not read from _meta');
  assert.doesNotMatch(CODE_ONLY, /total_industries/,
    '_meta.total_industries says 22 while there are 20 — nothing may rely on it');
});

// ── behaviour: a real scan over loopback ─────────────────────────────────

test('10 a scan completes without throwing — the original threw here', async () => {
  const r = await scan(DENTAL_HTML);
  assert.equal(r.success, true);
  assert.equal(typeof r.gap_score, 'number');
});

test('11 the dental fixture is detected and its profile attached', async () => {
  const r = await scan(DENTAL_HTML);
  assert.equal(r.detected_industry, 'dental');
  assert.ok(r.industry_profile, 'industry_profile must not be null for a supported industry');
  assert.ok(r.industry_benchmarks, 'industry_benchmarks must not be null');
  assert.equal(typeof r.industry_benchmarks.has_online_booking, 'number');
});

test('12 M3 detected_industry keeps its lowercase underscore format', async () => {
  // It is persisted to an indexed TEXT column and rendered in the admin
  // dashboard. A drift to display labels would fragment existing rows.
  const r = await scan(DENTAL_HTML);
  assert.match(r.detected_industry, ID_FORMAT);
  assert.equal(r.detected_industry, r.detected_industry.toLowerCase());
});

test('13 lookup by canonical id resolves', async () => {
  const r = await scan(DENTAL_HTML, { industry: 'dental' });
  assert.ok(r.industry_profile);
  assert.equal(r.industry_benchmarks.has_online_booking, RAW.industries.dental.benchmarks.has_online_booking);
});

test('14 lookup by display label also resolves — backward compatibility', async () => {
  const r = await scan(DENTAL_HTML, { industry: 'Dental' });
  assert.ok(r.industry_profile, 'a caller passing the label must keep working');
  assert.equal(r.industry_benchmarks.has_online_booking, RAW.industries.dental.benchmarks.has_online_booking);
});

test('15 an unsupported industry yields null, and the scan still completes', async () => {
  const r = await scan(DENTAL_HTML, { industry: 'no_such_industry' });
  assert.equal(r.success, true);
  assert.equal(r.industry_profile, null);
  assert.equal(r.industry_benchmarks, null);
});

test('16 no silent fallback to another industry\'s benchmarks', async () => {
  const r = await scan(DENTAL_HTML, { industry: 'no_such_industry' });
  const known = Object.values(RAW.industries).map((p) => JSON.stringify(p.benchmarks));
  assert.ok(
    r.industry_benchmarks === null || !known.includes(JSON.stringify(r.industry_benchmarks)),
    'an unsupported industry must not receive some other industry\'s benchmarks',
  );
});

test('17 M2 the four unprofiled trades scan without throwing and stay null', async () => {
  for (const [key, terms] of Object.entries(TRADES)) {
    assert.equal(RAW.industries[key], undefined, `${key} is expected to have no profile`);
    const r = await scan(TRADE_HTML(terms));
    assert.equal(r.success, true, `${key}: scan must complete`);
    assert.equal(r.detected_industry, key, `${key}: expected this trade to be detected`);
    assert.equal(r.industry_profile, null, `${key}: profile must be null, not invented`);
    assert.equal(r.industry_benchmarks, null, `${key}: benchmarks must be null`);
  }
});

test('18 all 18 evidence fields are present on every scan', async () => {
  const EXPECTED = [
    'ssl', 'status', 'mobile_viewport', 'has_title', 'has_og_meta', 'has_analytics',
    'has_online_booking', 'has_live_chat', 'has_review_widget', 'has_contact_form',
    'has_newsletter', 'has_payment', 'has_social_links', 'has_faq', 'has_sitemap',
    'response_time_ms', 'server', 'content_security_policy',
  ];
  const r = await scan(DENTAL_HTML);
  for (const f of EXPECTED) assert.ok(f in r.evidence, `missing evidence field: ${f}`);
  assert.equal(Object.keys(r.evidence).length, EXPECTED.length);
});

test('19 an unreachable host reports a failure, not a perfect gap score', async () => {
  const r = await scanUrl('http://127.0.0.1:1/');
  assert.notEqual(r.gap_score, 100, 'an unreachable host must not score as a 100% gap');
  assert.ok(r.success === false || r.failure_kind || r.error,
    'the result must carry a failure signal');
});

// ── the /api/gap-scan/industries contract ────────────────────────────────

test('20 the endpoint exposes the canonical id and preserves the label', () => {
  // Pin the real handler, not just the reproduction: the shipped mapping
  // must emit the canonical key and must no longer emit the label as id.
  assert.match(CODE_ONLY, /id:\s*p\.id\b/, 'the handler must emit id: p.id');
  assert.doesNotMatch(CODE_ONLY, /id:\s*p\.industry\b/,
    'the handler must not emit the display label as the id');
  assert.match(CODE_ONLY, /industry:\s*p\.industry\b/,
    'the handler must still expose the human-readable label');

  const body = endpointShape();
  assert.equal(body.length, 20);
  for (const e of body) {
    assert.match(e.id, ID_FORMAT, `endpoint id ${JSON.stringify(e.id)} must be canonical`);
    assert.equal(typeof e.industry, 'string');
    assert.ok(e.industry.trim().length > 0);
    assert.ok(Array.isArray(e.sub_industries));
    assert.equal(typeof e.group, 'string');
  }
});

test('21 the endpoint satisfies the existing integration-test expectation', () => {
  // agents/backend/tests/integration.test.js:291
  //   const dental = r.body.find(i => i.id === 'dental');
  const body = endpointShape();
  const dental = body.find((i) => i.id === 'dental');
  assert.ok(dental, 'dental must be in the list, found by id — integration.test.js:291');
  assert.ok('sub_industries' in dental, 'integration.test.js:293 asserts sub_industries');
  assert.ok(body.length >= 10, 'integration.test.js:290 asserts >= 10 industries');
});

// ── NEGATIVE CONTROLS ────────────────────────────────────────────────────
// Each reproduces an original or deliberately-wrong implementation from the
// real data file and asserts the defect is detectable. If any of these stops
// failing against the bad implementation, the suite above has lost its teeth.

test('NC1 the original return value has no .find — reproduces the crash', () => {
  const original = RAW;                      // what loadProfiles() used to return
  assert.equal(typeof original.find, 'undefined',
    'the original wrapper object has no .find — this is the TypeError');
  assert.throws(() => original.find((p) => p.industry === 'dental'), TypeError);
});

test('NC2 the naive Object.values fix silently loses every profile', () => {
  const naive = Object.values(RAW.industries);           // shape fixed, key discarded
  const hit = naive.find((p) => p.industry === 'dental'); // the original predicate
  assert.equal(hit, undefined,
    'the naive fix returns undefined for a key lookup — a silent null, not a crash');
  // and the real implementation must NOT behave that way
  assert.match(CODE_ONLY, /p\.id === detectedIndustry/,
    'the shipped lookup must match on the canonical id');
});

test('NC3 the naive endpoint mapping breaks the integration test', () => {
  const naive = Object.values(RAW.industries).map((p) => ({ id: p.industry }));
  assert.equal(naive.find((i) => i.id === 'dental'), undefined,
    'id: p.industry yields "Dental" — integration.test.js:291 would fail');
  assert.ok(endpointShape().find((i) => i.id === 'dental'),
    'the real mapping must satisfy integration.test.js:291');
});

test('NC4 a label-only lookup would break canonical-id callers', () => {
  const profiles = profilesAsLoaded();
  const labelOnly = (d) => profiles.find((p) => p.industry === d) || null;
  assert.equal(labelOnly('dental'), null,
    'a label-only predicate cannot resolve the key detectIndustry returns');
  const tolerant = (d) => profiles.find((p) => p.id === d || p.industry === d) || null;
  assert.ok(tolerant('dental'), 'the shipped predicate resolves the key');
  assert.ok(tolerant('Dental'), 'the shipped predicate also resolves the label');
});
