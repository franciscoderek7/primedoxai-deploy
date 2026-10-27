/**
 * Council stage-derivation tests.
 *
 * Dependency-free: no @anthropic-ai/sdk, no network, no API key, no
 * model call. summarizeAnalysis is pure, and the stage rule is asserted
 * against synthetic outcomes.
 *
 * The property under test: a pipeline stage may only advance on evidence
 * of completed work. An attempt is not a completion.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { summarizeAnalysis } = require('../council-engine.js');
const ENGINE_SRC = fs.readFileSync(path.join(__dirname, '..', 'council-engine.js'), 'utf8');

const ex = (...statuses) => statuses.map((s, i) => ({ id: `e${i}`, analysisStatus: s }));

// Mirrors the rule in createCouncilCase. Asserted against it below so the
// two cannot drift apart silently.
const stageFor = (o) => (o.complete > 0 ? 'SPECIALIST_ANALYSIS' : 'INTAKE');

test('summarizeAnalysis counts every outcome', () => {
  const o = summarizeAnalysis(ex('COMPLETE', 'UNAVAILABLE', 'ERROR'));
  assert.deepEqual(o, { total: 3, complete: 1, unavailable: 1, error: 1, missing: 0 });
});

test('summarizeAnalysis tolerates missing and malformed entries', () => {
  assert.deepEqual(
    summarizeAnalysis([null, {}, { id: 'x' }, { id: 'y', analysisStatus: 'COMPLETE' }]),
    { total: 4, complete: 1, unavailable: 0, error: 0, missing: 3 },
  );
  assert.deepEqual(summarizeAnalysis([]), { total: 0, complete: 0, unavailable: 0, error: 0, missing: 0 });
  assert.deepEqual(summarizeAnalysis(undefined), { total: 0, complete: 0, unavailable: 0, error: 0, missing: 0 });
});

// ── The gap this change closes ─────────────────────────────────────────

test('no API key does NOT advance the stage', () => {
  const o = summarizeAnalysis(ex('UNAVAILABLE', 'UNAVAILABLE', 'UNAVAILABLE'));
  assert.equal(o.complete, 0);
  assert.equal(stageFor(o), 'INTAKE', 'zero analyses completed — the stage must not advance');
});

test('every call failing does NOT advance the stage', () => {
  const o = summarizeAnalysis(ex('ERROR', 'ERROR', 'ERROR'));
  assert.equal(stageFor(o), 'INTAKE', 'zero analyses completed — the stage must not advance');
});

test('a genuine analysis DOES advance the stage', () => {
  const o = summarizeAnalysis(ex('COMPLETE', 'COMPLETE', 'COMPLETE'));
  assert.equal(stageFor(o), 'SPECIALIST_ANALYSIS');
});

test('a partial analysis advances the stage but is recorded as partial', () => {
  const o = summarizeAnalysis(ex('COMPLETE', 'ERROR', 'UNAVAILABLE'));
  assert.equal(stageFor(o), 'SPECIALIST_ANALYSIS');
  assert.equal(o.complete, 1);
  assert.notEqual(o.complete, o.total, 'must be distinguishable from a full analysis');
});

test('the three failure outcomes are distinguishable from each other', () => {
  const none = summarizeAnalysis(ex('UNAVAILABLE', 'UNAVAILABLE', 'UNAVAILABLE'));
  const errs = summarizeAnalysis(ex('ERROR', 'ERROR', 'ERROR'));
  const good = summarizeAnalysis(ex('COMPLETE', 'COMPLETE', 'COMPLETE'));
  assert.notDeepEqual(none, errs, 'no-key must not look like API-failure');
  assert.notDeepEqual(none, good);
  assert.notDeepEqual(errs, good);
});

// ── The stage rule in the source must match the rule tested above ──────

test('the engine derives the stage rather than asserting it', () => {
  assert.doesNotMatch(
    ENGINE_SRC, /councilPipelineStage = "SPECIALIST_ANALYSIS";/,
    'the stage must not be assigned unconditionally after the AI call',
  );
  assert.match(
    ENGINE_SRC, /outcome\.complete > 0\s*\?\s*"SPECIALIST_ANALYSIS"\s*:\s*"INTAKE"/,
    'the stage must be derived from completed analyses',
  );
});

// ── Guardrails that must survive any future edit ──────────────────────

test('every execution authority stays denied in the source', () => {
  for (const flag of [
    'financialExecutionAllowed',
    'legalExecutionAllowed',
    'securityExecutionAllowed',
    'destructiveExecutionAllowed',
    'productionDeploymentAllowed',
  ]) {
    assert.match(ENGINE_SRC, new RegExp(`${flag}:\\s*false`), `${flag} must be false`);
    assert.doesNotMatch(ENGINE_SRC, new RegExp(`${flag}:\\s*true`), `${flag} must never be true`);
  }
});

test('the proposal stays proposal-only and human-gated', () => {
  assert.match(ENGINE_SRC, /status:\s*"PROPOSED"/);
  assert.match(ENGINE_SRC, /humanDecision:\s*"REQUIRED"/);
  assert.doesNotMatch(ENGINE_SRC, /status:\s*"(APPROVED|EXECUTED|VERIFIED)"/);
});

test('authority flags are set before the AI call, never from AI output', () => {
  const flagAt = ENGINE_SRC.indexOf('financialExecutionAllowed');
  const aiAt = ENGINE_SRC.indexOf('analyzeCouncil');
  assert.ok(flagAt !== -1 && aiAt !== -1);
  assert.ok(flagAt < aiAt, 'authority must be fixed before any model output is merged');
});

test('no credential is read or recorded by the engine', () => {
  assert.doesNotMatch(ENGINE_SRC, /ANTHROPIC_API_KEY/, 'the engine must never touch the key');
  assert.doesNotMatch(ENGINE_SRC, /process\.env\./, 'the engine reads no environment at all');
});

test('proposals are written with owner-only permissions', () => {
  assert.match(ENGINE_SRC, /mode:\s*0o600/, 'proposal files must stay mode 0600');
});

test('the engine performs no verification and never claims to', () => {
  // Verification is a separate, human-gated step that does not exist yet.
  // Nothing here may imply it happened.
  assert.doesNotMatch(ENGINE_SRC, /verified\s*[:=]\s*true/i);
  assert.doesNotMatch(ENGINE_SRC, /"VERIFIED"/);
});

test('importing the engine does not terminate the host process', () => {
  // The original called process.exit(0) at module load when argv was
  // empty, so `require`ing it killed any host — including a test runner,
  // which made a whole suite silently vacuous.
  assert.match(ENGINE_SRC, /require\.main !== module/, 'the CLI block must be guarded');
  assert.ok(
    ENGINE_SRC.indexOf('module.exports') < ENGINE_SRC.indexOf('process.exit'),
    'exports must be assigned before any exit path is reachable',
  );
});

test('the engine exposes a testable surface', () => {
  const m = require('../council-engine.js');
  assert.equal(typeof m.summarizeAnalysis, 'function');
  assert.equal(typeof m.createCouncilCase, 'function');
});

test('the AI runtime is required lazily so a missing SDK degrades', () => {
  // A top-level require of the SDK crashed the engine before any
  // proposal could be written. ai-runtime.js documents graceful
  // degradation; the engine must not defeat it.
  const top = ENGINE_SRC.split('async function createCouncilCase')[0];
  assert.doesNotMatch(top, /require\(["']\.\/ai-runtime["']\)/,
    'the runtime must not be required at module top level');
  assert.match(ENGINE_SRC, /require\(["']\.\/ai-runtime["']\)/,
    'the runtime must still be required somewhere');
});

// ── E5: structural acceptance is not verification ──────────────────────

test('E5 the basis of a COMPLETE analysis is recorded explicitly', () => {
  const { ANALYSIS_BASIS } = require('../council-engine.js');
  assert.equal(ANALYSIS_BASIS, 'structural_response_acceptance');
  assert.match(ENGINE_SRC, /basis: ANALYSIS_BASIS/,
    'every proposal must record what COMPLETE is based on');
});

test('E5 the engine never records a verification result', () => {
  // Verification needs explicit evidence and a defined passing policy.
  // Neither exists here, so the field must be an explicit null.
  assert.match(ENGINE_SRC, /proposal\.verification = null;/,
    'verification must be recorded as an explicit null, not omitted');
  assert.doesNotMatch(ENGINE_SRC, /proposal\.verification = (?!null)/,
    'this engine must never populate a verification result');
});

test('E5 a model analysisStatus is never copied into a verification field', () => {
  assert.doesNotMatch(
    ENGINE_SRC, /verification[^=\n]*=[^;\n]*analysisStatus/,
    'model output must not become a verification record',
  );
  assert.doesNotMatch(
    ENGINE_SRC, /verification[^=\n]*=[^;\n]*(COMPLETE|true)/,
    'verification must not be derived from a completion count or hardcoded true',
  );
});

test('E5 the specialistAnalysis spread is of a locally built object only', () => {
  // A spread of caller-supplied metadata would be an arbitrary-field
  // bypass. This one spreads summarizeAnalysis output, which has five
  // fixed keys built in this file.
  assert.doesNotMatch(ENGINE_SRC, /\.\.\.metadata|\.\.\.(req|body|input|params)\b/,
    'no caller-supplied object may be spread into a proposal');
  assert.match(ENGINE_SRC, /\.\.\.outcome/);
  assert.match(ENGINE_SRC, /const outcome = summarizeAnalysis\(/,
    'outcome must be built locally, immediately before the spread');
});

test('E5 no execution flag was weakened by this change', () => {
  for (const flag of [
    'financialExecutionAllowed', 'legalExecutionAllowed',
    'securityExecutionAllowed', 'destructiveExecutionAllowed',
    'productionDeploymentAllowed',
  ]) {
    assert.match(ENGINE_SRC, new RegExp(`${flag}:\\s*false`));
    assert.doesNotMatch(ENGINE_SRC, new RegExp(`${flag}:\\s*true`));
  }
  assert.match(ENGINE_SRC, /humanDecision:\s*"REQUIRED"/);
});

// ── E6: real behaviour, not source text ───────────────────────────────
//
// Every test above this line reads source or calls a pure helper. These
// run the engine as a child process in a throwaway temp directory and
// assert what it actually wrote and printed. No SDK, no API key, no
// network: with no node_modules in the temp tree the lazy
// require("./ai-runtime") fails and the engine must degrade.
//
// The temp tree is used so the 7 real proposals are never touched.

const os = require('node:os');
const { execFileSync } = require('node:child_process');

function runEngineInTempTree(problem) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'fhi-council-'));
  const int = path.join(base, 'intelligence');
  const councilDir = path.join(int, 'council');
  fs.mkdirSync(councilDir, { recursive: true });
  fs.mkdirSync(path.join(int, 'avatars'), { recursive: true });
  fs.mkdirSync(path.join(int, 'proposals'), { recursive: true });

  const srcCouncil = path.join(__dirname, '..');
  const srcInt = path.join(srcCouncil, '..');
  for (const f of ['council-engine.js', 'ai-runtime.js']) {
    fs.copyFileSync(path.join(srcCouncil, f), path.join(councilDir, f));
  }
  for (const f of fs.readdirSync(path.join(srcInt, 'avatars'))) {
    fs.copyFileSync(path.join(srcInt, 'avatars', f), path.join(int, 'avatars', f));
  }

  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;

  const stdout = execFileSync(
    process.execPath,
    [path.join(councilDir, 'council-engine.js'), problem],
    { cwd: councilDir, env, encoding: 'utf8', timeout: 20000 },
  );

  const written = fs.readdirSync(path.join(int, 'proposals')).filter(f => f.endsWith('.json'));
  const proposal = written.length
    ? JSON.parse(fs.readFileSync(path.join(int, 'proposals', written[0]), 'utf8'))
    : null;

  return { stdout, proposal, base };
}

test('E6 BEHAVIOUR a proposal is written even with no AI runtime available', () => {
  const { proposal } = runEngineInTempTree('E6 behavioural probe');
  assert.ok(proposal, 'a proposal file must be written');
  assert.equal(proposal.status, 'PROPOSED');
  assert.equal(proposal.humanDecision, 'REQUIRED');
});

test('E6 BEHAVIOUR the written proposal records basis and a null verification', () => {
  const { proposal } = runEngineInTempTree('E6 field probe');
  assert.equal(proposal.specialistAnalysis.basis, 'structural_response_acceptance');
  assert.equal(proposal.verification, null);
  assert.equal(proposal.specialistAnalysis.complete, 0, 'no runtime means no completed analysis');
  assert.equal(proposal.councilPipelineStage, 'INTAKE', 'the stage must not advance');
});

test('E6 BEHAVIOUR every execution flag is false in the written file', () => {
  const { proposal } = runEngineInTempTree('E6 flag probe');
  for (const flag of [
    'financialExecutionAllowed', 'legalExecutionAllowed',
    'securityExecutionAllowed', 'destructiveExecutionAllowed',
    'productionDeploymentAllowed',
  ]) {
    assert.equal(proposal[flag], false, `${flag} must be false in the written proposal`);
  }
});

test('E6 BEHAVIOUR the operator-facing output states the basis and that nothing is verified', () => {
  // The file being honest is not enough. The CLI is what a human reads.
  const { stdout } = runEngineInTempTree('E6 output probe');
  assert.match(stdout, /BASIS:\s+structural_response_acceptance/,
    'the output must state what the analysis is based on');
  assert.match(stdout, /VERIFIED:\s+NO — no verification has been performed/,
    'the output must state plainly that nothing was verified');
  assert.match(stdout, /not independently verified/,
    'the analysis heading must be qualified');
  assert.match(stdout, /HUMAN DECISION REQUIRED/);
});

test('E6 BEHAVIOUR no credential or secret appears in the output', () => {
  const { stdout } = runEngineInTempTree('E6 secret probe');
  for (const re of [/sk_live/, /sk_test/, /ANTHROPIC_API_KEY/, /AIza[0-9A-Za-z_-]{20,}/]) {
    assert.doesNotMatch(stdout, re);
  }
});
