/**
 * PrimeDox HQ — Supabase Client
 * Public config only (publishable key). No secret keys.
 * Loaded after supabase-js CDN script.
 */
(function () {
  'use strict';

  var SUPA_URL = 'https://ilmlnehehfcxwlurzfxd.supabase.co';
  var SUPA_KEY = 'sb_publishable_aHi9NfxdTCPUWKO1AWX6vg_sZFj-XYA';

  var _client = null;

  function db() {
    if (_client) return _client;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      _client = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
        auth: { persistSession: true, storageKey: 'fhi_sb_session' }
      });
    }
    return _client;
  }

  var FHI = {

    // ── AUTH ─────────────────────────────────────────────────────────────────

    signup: async function (email, password, refCode) {
      var s = db();
      if (!s) return { error: 'Connection unavailable — try again.' };
      try {
        var r = await s.auth.signUp({ email: email, password: password });
        if (r.error) return { error: r.error.message };
        if (r.data && r.data.user && refCode) {
          await FHI.applyRef(r.data.user.id, refCode.trim().toUpperCase());
        }
        return { ok: true, user: r.data.user };
      } catch (e) {
        console.error('[FHI:signup]', e);
        return { error: 'Signup failed. Check your connection.' };
      }
    },

    login: async function (email, password) {
      var s = db();
      if (!s) return { error: 'Connection unavailable — try again.' };
      try {
        var r = await s.auth.signInWithPassword({ email: email, password: password });
        if (r.error) return { error: r.error.message };
        localStorage.setItem('fhi_user_email', email);
        return { ok: true, user: r.data.user, session: r.data.session };
      } catch (e) {
        console.error('[FHI:login]', e);
        return { error: 'Login failed. Check your connection.' };
      }
    },

    logout: async function () {
      var s = db();
      if (s) { try { await s.auth.signOut(); } catch (e) {} }
      localStorage.removeItem('fhi_user_email');
      localStorage.removeItem('fhi_ref_code');
      localStorage.removeItem('zprimedox_hq_unlocked');
    },

    resetPassword: async function (email) {
      var s = db();
      if (!s) return { error: 'Connection unavailable.' };
      try {
        var r = await s.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/index.html'
        });
        if (r.error) return { error: r.error.message };
        return { ok: true };
      } catch (e) {
        return { error: 'Could not send reset email.' };
      }
    },

    getSession: async function () {
      var s = db();
      if (!s) return null;
      try {
        var r = await s.auth.getSession();
        return (r.data && r.data.session) ? r.data.session : null;
      } catch (e) { return null; }
    },

    getProfile: async function (userId) {
      var s = db();
      if (!s) return null;
      try {
        var r = await s.from('user_profiles').select('*').eq('id', userId).single();
        return r.data || null;
      } catch (e) { return null; }
    },

    // ── REFERRALS ────────────────────────────────────────────────────────────

    verifyRef: async function (code) {
      if (!code) return null;
      var s = db();
      if (!s) return null;
      try {
        var r = await s.from('referrals')
          .select('code, discount_percent, uses')
          .eq('code', code.trim().toUpperCase())
          .single();
        return r.data || null;
      } catch (e) { return null; }
    },

    applyRef: async function (userId, code) {
      var s = db();
      if (!s || !code) return 0;
      try {
        var r = await s.from('referrals')
          .select('id, discount_percent, uses')
          .eq('code', code)
          .single();
        if (!r.data) return 0;
        await s.from('referrals').update({ uses: r.data.uses + 1 }).eq('id', r.data.id);
        await s.from('user_profiles').update({ discount_tier: 'referral' }).eq('id', userId);
        localStorage.setItem('fhi_ref_code', code);
        return r.data.discount_percent || 10;
      } catch (e) { return 0; }
    },

    getMyRefCode: async function (userId) {
      var s = db();
      if (!s) return localStorage.getItem('my_ref_code') || null;
      try {
        var r = await s.from('user_profiles').select('referral_code').eq('id', userId).single();
        if (r.data && r.data.referral_code) {
          localStorage.setItem('my_ref_code', r.data.referral_code);
          return r.data.referral_code;
        }
        return localStorage.getItem('my_ref_code') || null;
      } catch (e) { return localStorage.getItem('my_ref_code') || null; }
    },

    // ── TRIAL ────────────────────────────────────────────────────────────────

    trialSignup: async function (email, refCode) {
      var now = new Date();
      var endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      // Always store locally as fallback
      localStorage.setItem('trial_email', email);
      localStorage.setItem('trial_end', endDate.toISOString());

      var s = db();
      if (!s) return { fallback: true };
      try {
        var r = await s.from('trial_signups').insert({
          email: email,
          referral_code: refCode || null,
          trial_end_date: endDate.toISOString()
        });
        if (r.error && r.error.code === '23505') {
          // Already signed up — update end date
          await s.from('trial_signups').update({ trial_end_date: endDate.toISOString() }).eq('email', email);
        }
        return { ok: true };
      } catch (e) { return { fallback: true }; }
    },

    checkTrial: function () {
      var end = localStorage.getItem('trial_end');
      var email = localStorage.getItem('trial_email');
      if (!end) return null;
      var endTs = new Date(end).getTime();
      var now = Date.now();
      if (now >= endTs) return { expired: true, email: email };
      var rem = endTs - now;
      return {
        active: true,
        email: email,
        hours: Math.floor(rem / 3600000),
        mins: Math.floor((rem % 3600000) / 60000),
        secs: Math.floor((rem % 60000) / 1000),
        ms: rem
      };
    },

    clearTrial: function () {
      localStorage.removeItem('trial_email');
      localStorage.removeItem('trial_end');
    },

    // ── URL REFERRAL HELPER ──────────────────────────────────────────────────

    getRefFromURL: function () {
      try {
        return new URLSearchParams(window.location.search).get('ref') || null;
      } catch (e) { return null; }
    }

  };

  window.FHI_SUPA = FHI;
  window.FHI = FHI; // short alias

})();
