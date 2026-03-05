"use client";

import { useState, useEffect } from "react";

interface TopicFeedback {
  topicId: string;
  topicName: string;
  rating: string | null;
}

interface BriefingFeedbackProps {
  briefingId: string;
  /** Topics covered in this briefing, with their IDs */
  topics: { id: string; name: string }[];
  /** Any existing feedback the user already submitted for this briefing */
  existingFeedback: { topic_id: string; rating: string }[];
}

const RATING_OPTIONS = [
  {
    value: "too_basic",
    label: "Too Basic",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    description: "I already know this stuff",
  },
  {
    value: "spot_on",
    label: "Spot On",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    description: "Perfect depth and detail",
  },
  {
    value: "go_deeper",
    label: "Go Deeper",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    description: "I want more analysis",
  },
];

/** Storage key for dismissed feedback cards */
function getDismissKey(briefingId: string) {
  return `bb_feedback_dismissed_${briefingId}`;
}

export default function BriefingFeedback({
  briefingId,
  topics,
  existingFeedback,
}: BriefingFeedbackProps) {
  const [topicRatings, setTopicRatings] = useState<TopicFeedback[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize topic ratings from existing feedback
  useEffect(() => {
    // Check if already dismissed in localStorage
    if (typeof window !== "undefined") {
      const wasDismissed = localStorage.getItem(getDismissKey(briefingId));
      if (wasDismissed === "true") {
        setDismissed(true);
        return;
      }
    }

    const ratings: TopicFeedback[] = topics.map((t) => {
      const existing = existingFeedback.find((f) => f.topic_id === t.id);
      return {
        topicId: t.id,
        topicName: t.name,
        rating: existing?.rating ?? null,
      };
    });
    setTopicRatings(ratings);

    // If all topics already have feedback, show as saved
    if (ratings.length > 0 && ratings.every((r) => r.rating !== null)) {
      setSaved(true);
    }
  }, [briefingId, topics, existingFeedback]);

  if (dismissed || topics.length === 0) return null;

  function handleRating(topicId: string, rating: string) {
    setTopicRatings((prev) =>
      prev.map((t) =>
        t.topicId === topicId
          ? { ...t, rating: t.rating === rating ? null : rating } // Toggle off if same
          : t
      )
    );
    setSaved(false);
    setError(null);
  }

  function handleDismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem(getDismissKey(briefingId), "true");
    }
    setDismissed(true);
  }

  async function handleSubmit() {
    const ratingsToSubmit = topicRatings.filter((t) => t.rating !== null);
    if (ratingsToSubmit.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefingId,
          ratings: ratingsToSubmit.map((r) => ({
            topicId: r.topicId,
            rating: r.rating,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save feedback");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const hasAnyRating = topicRatings.some((t) => t.rating !== null);
  const allRated = topicRatings.every((t) => t.rating !== null);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2.5">
          <svg
            className="w-4.5 h-4.5 text-accent shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <h3 className="text-sm font-bold text-primary">Rate This Briefing</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-primary transition-colors p-1 -m-1"
          aria-label="Dismiss feedback"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          Help us calibrate the depth of each topic to your expertise.
        </p>

        {topicRatings.map((topic) => (
          <div key={topic.topicId} className="space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {topic.topicName}
            </p>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((option) => {
                const isSelected = topic.rating === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleRating(topic.topicId, option.value)}
                    disabled={saving}
                    title={option.description}
                    className={`
                      inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
                      border transition-all duration-150
                      ${
                        isSelected
                          ? option.value === "spot_on"
                            ? "bg-accent/10 border-accent/30 text-accent"
                            : option.value === "go_deeper"
                            ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                            : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                          : "bg-card border-border text-muted-foreground hover:border-slate-300 hover:text-primary dark:hover:border-slate-600"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {!saved && (
            <button
              onClick={handleSubmit}
              disabled={!hasAnyRating || saving}
              className="rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : allRated ? "Submit Feedback" : "Submit"}
            </button>
          )}

          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Feedback saved — thank you!
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
