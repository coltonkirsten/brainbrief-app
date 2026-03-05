"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Detects when a user clicks an email link meant for a different account.
 * Shows a dismissable banner when the `uid` query param doesn't match
 * the currently logged-in user. Non-blocking — user can still access
 * their own dashboard.
 */
export default function EmailMismatchBanner({
  currentUserId,
  currentUserEmail,
}: {
  currentUserId: string;
  currentUserEmail: string;
}) {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const ref = searchParams.get("ref");
  const uid = searchParams.get("uid");

  // Only show when arriving from an email link with a mismatched user ID
  if (!ref || ref !== "email" || !uid || uid === currentUserId || dismissed) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <svg
          className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">
            Wrong account
          </p>
          <p className="text-sm text-amber-800 mt-1">
            You&apos;re signed in as <strong>{currentUserEmail}</strong>, but
            the email link you clicked was for a different account. To view that
            briefing, sign out and log in with the correct account.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
