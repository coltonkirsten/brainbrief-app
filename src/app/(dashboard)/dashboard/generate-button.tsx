"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GenerateButtonProps {
  hasTopics: boolean;
  lastBriefingAt: string | null;
}

const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export default function GenerateButton({
  hasTopics,
  lastBriefingAt,
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

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading || isRateLimited}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Generating..."
          : isRateLimited
            ? `Available in ${minutesLeft}m`
            : "Send my briefing now"}
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
