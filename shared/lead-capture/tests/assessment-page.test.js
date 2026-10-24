"use strict";
/* Structural tests for francisco-holdings-site/assessment.html — the wiring,
 * not the styling. The property that matters: a lead may only be recorded on
 * an observed success. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SITE = path.resolve(__dirname, "../../../francisco-holdings-site");
const PAGE = path.join(SITE, "assessment.html");
const html = fs.readFileSync(PAGE, "utf8");

test("both script dependencies resolve from the page's location", () => {
  const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  assert.ok(srcs.length >= 2, "expected the intake and funnel scripts");
  for (const s of srcs) {
    const resolved = path.resolve(SITE, s);
    assert.equal(fs.existsSync(resolved), true, `${s} -> ${resolved} missing`);
  }
});

test("a lead is recorded ONLY inside the received branch", () => {
  const i = html.indexOf("r.status==='received'");
  const j = html.indexOf("lead_submitted", i);
  assert.ok(i > -1, "received branch present");
  assert.ok(j > i, "lead_submitted must appear after the received check");
  // and must not appear before it anywhere in the submit handler
  const submitStart = html.indexOf("form.addEventListener('submit'");
  const before = html.slice(submitStart, i);
  assert.equal(before.includes("lead_submitted"), false,
    "lead_submitted must not be reachable before the received check");
});

test("the honeypot is present, hidden, and excluded from the tab order", () => {
  assert.match(html, /id="_confirm_human"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /\.hp\{position:absolute;left:-9999px/);
});

test("required fields match the intake module's contract", () => {
  const I = require(path.resolve(__dirname, "../fhi-intake.js"));
  for (const f of I.FIELDS.required) {
    assert.match(html, new RegExp(`id="${f}"[^>]*`), `input for ${f}`);
  }
});

test("the page is responsive and accessible in the basics", () => {
  assert.match(html, /<meta name="viewport" content="width=device-width/);
  assert.match(html, /<html lang="en-CA"/);
  assert.match(html, /role="status"[^>]*aria-live="polite"/);
  // every input has a label bound by `for`
  const ids = [...html.matchAll(/<(?:input|textarea|select)[^>]*id="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) {
    assert.match(html, new RegExp(`<label for="${id}"`), `label missing for #${id}`);
  }
});

test("no payment is taken on this page and no retired handle appears", () => {
  for (const re of [/paypal\.me/i, /stripe/i, /derekfranciaco1/i, /checkout/i]) {
    assert.equal(re.test(html), false, `page must not reference ${re}`);
  }
  assert.match(html, /No payment is taken on this page/i);
});

test("no banned personal information and no fabricated proof", () => {
  for (const re of [/705-?307-?8080/, /Kent St/i, /K9V ?2Z8/i, /derek@franciscoholdings/i]) {
    assert.equal(re.test(html), false, `page must not contain ${re}`);
  }
  // no invented social proof
  assert.equal(/our clients say|trusted by \d|\d+\+? (happy )?clients|ISO 27001|SOC 2/i.test(html), false);
});

test("the page states what the review is NOT", () => {
  assert.match(html, /not a penetration test/i);
  assert.match(html, /no prediction about your revenue/i);
});

test("tags are balanced for the elements that matter", () => {
  for (const tag of ["html", "head", "body", "main", "form", "footer", "header"]) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, "g")) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, "g")) || []).length;
    assert.equal(open, close, `<${tag}> ${open} open vs ${close} close`);
  }
});
