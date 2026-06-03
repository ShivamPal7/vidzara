"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Inner component that reads `?ref=` from the URL and persists the referral
 * code both as a client-side cookie (30-day expiry) and in localStorage as a
 * backup. This component renders nothing — it is purely a side-effect runner.
 *
 * NOTE: All reward logic happens server-side in completeOnboarding(). This
 * component only stores the referral code so the server can read it later.
 */
function ReferralTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (!refCode) return;

    // Sanitise: only allow alphanumeric + hyphen/underscore, max 64 chars
    const sanitised = refCode.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
    if (!sanitised) return;

    // --- Cookie (30 days, SameSite=Lax, NOT httpOnly so JS can set it) ---
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = [
      `vidzara_ref=${encodeURIComponent(sanitised)}`,
      `expires=${expires.toUTCString()}`,
      "path=/",
      "SameSite=Lax",
    ].join("; ");

    // --- localStorage backup ---
    try {
      localStorage.setItem("vidzara_ref", sanitised);
    } catch {
      // localStorage may be unavailable in some private-browsing contexts.
      // Silently ignore — the cookie is the primary storage.
    }
  }, [searchParams]);

  return null;
}

/**
 * Public export wraps the inner component in a Suspense boundary because
 * `useSearchParams()` requires one in Next.js 14+.
 */
export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerInner />
    </Suspense>
  );
}
