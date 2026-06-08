/* CCLDR.NET — Membership verification module
 * Replaces `localStorage.getItem('ccldr_tier')` (a plain browser flag anyone could
 * edit in devtools) with a tier verified server-side by Supabase against a real
 * paid subscription row, gated by Row Level Security + the visitor's signed-in JWT.
 *
 * Include on every gated page:
 *   <script type="module" src="/membership.js"></script>
 *
 * Then call:
 *   const { tier, loggedIn } = await CCLDRAuth.getVerifiedTier();
 *
 * SETUP: replace SUPABASE_URL / SUPABASE_ANON_KEY below once the project exists.
 * The anon key is public-safe by design — it only grants what Row Level Security allows.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'SUPABASE_PROJECT_URL';       // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_PUBLIC_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TIER_ORDER = ['free', 'warrior', 'professional', 'elite', 'sovereign'];
const TIER_LABELS = { free: 'Free', warrior: 'Warrior', professional: 'Professional', elite: 'Elite', sovereign: 'Sovereign' };

let _tierPromise = null;

async function fetchVerifiedTier() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { tier: 'free', loggedIn: false, status: 'inactive', email: null };

    const { data, error } = await supabase.rpc('get_my_tier');
    if (error) {
      console.error('[CCLDR] get_my_tier failed:', error.message);
      return { tier: 'free', loggedIn: true, status: 'inactive', email: session.user.email };
    }
    if (!data || !data.length) {
      return { tier: 'free', loggedIn: true, status: 'inactive', email: session.user.email };
    }
    return { tier: data[0].tier, loggedIn: true, status: data[0].status, email: session.user.email };
  } catch (err) {
    console.error('[CCLDR] tier verification error:', err.message);
    return { tier: 'free', loggedIn: false, status: 'inactive', email: null };
  }
}

function tierRank(tier) {
  const idx = TIER_ORDER.indexOf(tier || 'free');
  return idx === -1 ? 0 : idx;
}

window.CCLDRAuth = {
  TIER_ORDER,
  TIER_LABELS,
  tierRank,

  /** Resolves once with { tier, loggedIn, status, email }. Cached for the page's lifetime. */
  getVerifiedTier() {
    if (!_tierPromise) _tierPromise = fetchVerifiedTier();
    return _tierPromise;
  },

  /** True if the verified tier meets or exceeds `required`. */
  async meetsRequirement(required) {
    const { tier } = await this.getVerifiedTier();
    return tierRank(tier) >= tierRank(required);
  },

  /** Send a magic-link sign-in email. Redirects back to `redirectTo` once clicked. */
  async sendMagicLink(email, redirectTo) {
    return supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo || window.location.href },
    });
  },

  async signOut() {
    await supabase.auth.signOut();
    _tierPromise = null;
  },

  supabase, // exposed for pages that need direct access (e.g. course_progress upserts)
};

/* ── Auto-bootstrap: hide/show every element tagged data-requires-tier,
 *    and fill any element tagged data-tier-label with the verified tier name.
 *    This runs automatically — pages do not need to call it manually, though
 *    they can also call CCLDRAuth.getVerifiedTier() directly for custom gating. ──
 */
(async function bootstrap() {
  const { tier, loggedIn } = await CCLDRAuth.getVerifiedTier();
  const rank = tierRank(tier);

  document.querySelectorAll('[data-tier-label]').forEach(el => {
    el.textContent = TIER_LABELS[tier] || 'Free';
  });

  document.querySelectorAll('[data-requires-tier]').forEach(el => {
    const required = el.getAttribute('data-requires-tier');
    el.style.display = rank >= tierRank(required) ? '' : 'none';
  });

  document.querySelectorAll('[data-locked-if-below]').forEach(el => {
    const required = el.getAttribute('data-locked-if-below');
    el.style.display = rank < tierRank(required) ? '' : 'none';
  });

  document.dispatchEvent(new CustomEvent('ccldr-tier-verified', { detail: { tier, loggedIn, rank } }));
})();
