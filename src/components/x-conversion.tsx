"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    twq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires the X (Twitter) Ads signup conversion event exactly once.
 *
 * Place this component on the page/view a user sees immediately after
 * completing signup (email confirmation + first sign-in). Currently used
 * in the onboarding view (0 topics = fresh signup).
 *
 * Gracefully no-ops if the base pixel (twq) is not loaded.
 *
 * @param email - user's email for audience matching (optional but recommended)
 * @param userId - user ID for dedup / conversion_id (optional but recommended)
 */
export function XSignupConversion({
  email,
  userId,
}: {
  email?: string | null;
  userId?: string | null;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (typeof window.twq !== "function") return;

    firedRef.current = true;

    window.twq("event", "tw-r8m7r-r8mcl", {
      email_address: email ?? null,
      conversion_id: userId ?? null,
    });

    console.log("[x-pixel] Signup conversion event fired");
  }, [email, userId]);

  return null;
}
