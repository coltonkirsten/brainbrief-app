"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface GenerateButtonProps {
  hasTopics: boolean;
  lastBriefingAt: string | null;
  canGenerate: boolean;
}

const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour

const PROGRESS_STEPS = [
  "Searching the web\u2026",
  "Reading through the latest news\u2026",
  "Writing your briefing\u2026",
  "Preparing your email\u2026",
];

export default function GenerateButton({
  hasTopics,
  lastBriefingAt,
  canGenerate,
}: GenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ungrounded, setUngrounded] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    setUngrounded(false);
    setLoading(true);
    setProgressStep(0);

    // Schedule progress step updates for a soothing experience
    timersRef.current = [
      setTimeout(() => setProgressStep(1), 4000),
      setTimeout(() => setProgressStep(2), 8000),
      setTimeout(() => setProgressStep(3), 13000),
    ];

    try {
      const res = await fetch("/api/briefings/generate", {
        method: "POST",
      });

      // Clear scheduled timers
      timersRef.current.forEach(clearTimeout);

      let data;
      try {
        data = await res.json();
      } catch {
        // JSON parse failed — likely a timeout or network issue
        console.error("[generate-button] Failed to parse response as JSON, status:", res.status);
        throw new Error("timeout");
      }

      if (!res.ok) {
        // Log raw error for debugging, show friendly message to user
        console.error("[generate-button] API error:", data);

        if (res.status === 429) {
          setError(data.message || "You can generate one briefing per hour. Please try again later.");
        } else if (res.status === 403) {
          setError(data.message || "Your trial has ended. Subscribe to keep generating briefings.");
        } else {
          throw new Error(data.message || data.error || "generation_failed");
        }
        setLoading(false);
        return;
      }

      setLoading(false);

      if (data.grounded === false) {
        setUngrounded(true);
      } else {
        setSuccess(true);
      }

      // Refresh the page to show the new briefing
      router.refresh();
    } catch (err) {
      timersRef.current.forEach(clearTimeout);
      const rawMessage = err instanceof Error ? err.message : "unknown";
      console.error("[generate-button] Error:", rawMessage);
      setError("friendly"); // Signal to show friendly error UI
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
          <a href="/subscribe" className="text-primary hover:underline font-medium">Subscribe to Brain Brief Pro</a> to generate briefings.
        </p>
      </div>
    );
  }

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Pulsing logo */}
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-md animate-pulse shrink-0">
            <span className="font-serif font-bold text-lg">B</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {PROGRESS_STEPS[progressStep]}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This usually takes about 15 seconds
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(((progressStep + 1) / 4) * 100, 95)}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={handleGenerate}
        disabled={isRateLimited}
        className="rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRateLimited
          ? `Available in ${minutesLeft}m`
          : "Generate Briefing"}
      </button>

      {/* Friendly error with retry */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 w-full">
          <p className="text-sm text-red-700 dark:text-red-400">
            {error === "friendly"
              ? "Something went wrong generating your briefing. Please try again in a moment."
              : error}
          </p>
          <button
            onClick={handleGenerate}
            className="mt-2 text-sm font-semibold text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-accent">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Briefing generated and sent to your email!
        </div>
      )}

      {ungrounded && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
          Overview briefing generated and sent. Live source citations will return in your next edition.
        </div>
      )}

      {!error && !success && !ungrounded && !isRateLimited && (
        <p className="text-xs text-muted-foreground">
          Generate an on-demand briefing (once per hour)
        </p>
      )}
    </div>
  );
}
