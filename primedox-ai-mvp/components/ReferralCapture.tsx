"use client";

import { useEffect } from "react";

// Reads ?ref=<user_id> from the landing page URL and stores it in a cookie so the
// auth callback (after the referred visitor eventually signs up) can read it and
// create the referrals row. 30-day window matches a typical signup-consideration period.
export default function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      document.cookie = `pdx_ref=${ref}; path=/; max-age=2592000`;
    }
  }, []);

  return null;
}
