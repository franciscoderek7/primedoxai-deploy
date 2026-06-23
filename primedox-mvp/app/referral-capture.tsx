"use client";

import { useEffect } from "react";

// Reads ?ref=<user_id> from the landing page URL and stores it in a cookie so the
// auth callback can create a referrals row once that visitor signs up.
export default function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      document.cookie = `pdx_ref=${ref}; path=/; max-age=2592000`;
    }
  }, []);

  return null;
}
