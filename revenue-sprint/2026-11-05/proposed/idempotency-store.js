// PROPOSED — persistent, atomic idempotency store. Not wired into anything.
// Claim/commit/release so a FAILED ledger write leaves the event RETRYABLE
// rather than marked processed. Atomicity comes from O_EXCL (flag 'wx'),
// which is atomic on POSIX filesystems.
const fs = require('fs');
const path = require('path');

const DONE = 'done';
const CLAIMED = 'claimed';

function createFileStore({ dir, leaseMs = 5 * 60 * 1000, now = Date.now } = {}) {
  if (!dir) throw new Error('dir required');
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

  const file = id => path.join(dir, encodeURIComponent(id) + '.json');

  function read(id) {
    try { return JSON.parse(fs.readFileSync(file(id), 'utf8')); }
    catch { return null; }
  }

  // Returns: 'claimed' (proceed) | 'duplicate' (already done) |
  //          'in_progress' (another worker holds a fresh lease)
  function claim(id) {
    const rec = { state: CLAIMED, at: now() };
    try {
      fs.writeFileSync(file(id), JSON.stringify(rec), { flag: 'wx', mode: 0o600 });
      return 'claimed';
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
    const existing = read(id);
    if (!existing) return 'claimed';                 // unreadable -> treat as fresh
    if (existing.state === DONE) return 'duplicate';
    // a stale lease means the previous attempt died: allow a retry
    if (now() - (existing.at || 0) > leaseMs) {
      fs.writeFileSync(file(id), JSON.stringify(rec), { mode: 0o600 });
      return 'claimed';
    }
    return 'in_progress';
  }

  function commit(id) {
    fs.writeFileSync(file(id), JSON.stringify({ state: DONE, at: now() }), { mode: 0o600 });
  }

  // Release on failure so the event can be retried by a later delivery.
  function release(id) {
    try { fs.unlinkSync(file(id)); } catch { /* already gone */ }
  }

  function state(id) { const r = read(id); return r ? r.state : null; }

  return { claim, commit, release, state };
}

module.exports = { createFileStore, DONE, CLAIMED };
