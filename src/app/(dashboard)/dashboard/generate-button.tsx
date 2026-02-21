"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GenerateButtonProps {
  hasTopics: boolean;
  lastBriefingAt: string | null;
  canGenerate: boolean;
}

const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export default function GenerateButton({
  hasTopics,
  lastBriefingAt,
  canGenerate,
}: GenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if rate-limited on the client side for instant feedback
  const isRateLimited = lastBriefingAt
    ? Date.now() - new Date(lastBriefingAt).getTime() < RATE_LIMIT_MS
    : false;

  const minutesLeft = lastBriefingAt
    ? Math.ceil(
        (RATE_LIMIT_MS - (Date.now() - new Date(lastBriefingAt).getTime())) /
          60000
      )
    : 0;

  async function handleGenerate() {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/briefings/generate", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      // Refresh the page to show the new briefing
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!hasTopics) {
    return null;
  }

  if (!canGenerate) {
    return (
      <div className="flex flex-col items-start gap-2">
        <button
          disabled
          className="rounded-lg bg-slate-300 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
        >
          Trial ended
        </button>
        <p className="text-sm text-muted-foreground">
          <a href="/#pricing" className="text-primary hover:underline font-medium">Subscribe to Brain Brief Pro</a> to generate briefings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={handleGenerate}
        disabled={loading || isRateLimited}
        className="rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Generating..."
          : isRateLimited
            ? `Available in ${minutesLeft}m`
            : "Generate Briefing"}
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">
          Briefing generated and sent to your email!
        </p>
      )}

      {!loading && !error && !success && !isRateLimited && (
        <p className="text-xs text-muted-foreground">
          Generate an on-demand briefing (once per hour)
        </p>
      )}
    </div>
  );
}
