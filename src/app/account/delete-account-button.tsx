"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setDeleting(false);
        return;
      }

      // Sign out locally and redirect to homepage
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/?deleted=true");
    } catch {
      setError("Network error. Please try again or contact support@brainbrief.app.");
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 px-4 py-3">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Are you sure? This cannot be undone.
          </p>
          <p className="mt-1 text-xs text-red-700 dark:text-red-400">
            This will permanently delete your account, topics, briefings, feedback,
            and cancel any active subscription.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Yes, delete my account"}
          </button>
          <button
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            disabled={deleting}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      Delete my account
    </button>
  );
}
