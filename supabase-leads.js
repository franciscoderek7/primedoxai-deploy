/**
 * supabase-leads.js — Empire Lead Capture Module
 * Paste your Supabase credentials below, then include this script on any site.
 * Usage: submitLead({ email, name, company, source })
 */

const SUPABASE_URL  = 'PASTE_YOUR_SUPABASE_URL_HERE';   // e.g. https://xyzxyz.supabase.co
const SUPABASE_ANON = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE'; // safe to expose in frontend

async function submitLead({ email, name = '', company = '', source = 'site' }) {
  if (!email || !email.includes('@')) return { ok: false, error: 'Invalid email' };

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': 'Bearer ' + SUPABASE_ANON,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email, name, company, source })
    });

    if (res.status === 409) return { ok: false, error: 'already_subscribed' };
    if (!res.ok) return { ok: false, error: 'server_error' };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: 'network_error' };
  }
}

/**
 * Wire up any form with data-lead-form attribute automatically.
 *
 * HTML pattern:
 *   <form data-lead-form data-source="omniaguard">
 *     <input type="email" name="email" required />
 *     <input type="text"  name="name"  />
 *     <button type="submit">Subscribe</button>
 *     <div data-lead-msg></div>
 *   </form>
 */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const msg = form.querySelector('[data-lead-msg]');
      const source = form.dataset.source || window.location.hostname.replace('www.', '').replace('.', '-');

      const email   = (form.querySelector('[name=email]') || {}).value || '';
      const name    = (form.querySelector('[name=name]')  || {}).value || '';
      const company = (form.querySelector('[name=company]')|| {}).value || '';

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      const result = await submitLead({ email, name, company, source });

      if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }

      if (msg) {
        if (result.ok) {
          msg.style.color = '#2e9e6b';
          msg.textContent = '✓ You\'re in. Welcome to the empire.';
          form.reset();
        } else if (result.error === 'already_subscribed') {
          msg.style.color = '#c9a84c';
          msg.textContent = '⚠ Already subscribed.';
        } else {
          msg.style.color = '#e63946';
          msg.textContent = '✗ Something went wrong. Try again.';
        }
      }
    });
  });
});
