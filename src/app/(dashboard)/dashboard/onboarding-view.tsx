"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { XSignupConversion } from "@/components/x-conversion";

interface OnboardingViewProps {
  userId: string;
  userEmail?: string;
  maxTopics: number;
}

const SUGGESTIONS = [
  "Artificial Intelligence",
  "SpaceX & NASA",
  "Venture Capital",
  "Clean Energy",
  "Longevity Research",
  "Cybersecurity",
  "Climate Tech",
  "Neuroscience",
  "Crypto & Web3",
  "Design Systems",
  "Geopolitics",
  "Enterprise SaaS",
];

const PROGRESS_STEPS = [
  "Saving your topics\u2026",
  "Searching the web for the latest news\u2026",
  "Generating your personalized briefing\u2026",
  "Almost done \u2014 preparing your email\u2026",
  "Your briefing is ready!",
];

export default function OnboardingView({ userId, userEmail, maxTopics }: OnboardingViewProps) {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const toggleSuggestion = useCallback((topic: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) return prev.filter((t) => t !== topic);
      if (prev.length >= maxTopics) return prev;
      return [...prev, topic];
    });
  }, []);

  function addCustomTopic() {
    const trimmed = customTopic.trim().substring(0, 100);
    if (!trimmed) return;
    if (selectedTopics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setCustomTopic("");
      return;
    }
    if (selectedTopics.length >= maxTopics) return;
    setSelectedTopics((prev) => [...prev, trimmed]);
    setCustomTopic("");
  }

  function removeTopic(topic: string) {
    setSelectedTopics((prev) => prev.filter((t) => t !== topic));
  }

  async function handleGetBriefing() {
    if (selectedTopics.length === 0 || generating) return;
    setGenerating(true);
    setError(null);
    setProgressStep(0);

    // Schedule progress step updates
    timersRef.current = [
      setTimeout(() => setProgressStep(1), 1500),
      setTimeout(() => setProgressStep(2), 6000),
      setTimeout(() => setProgressStep(3), 13000),
    ];

    try {
      // Step 1: Save all topics to DB
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("topics")
        .insert(selectedTopics.map((name) => ({ name, user_id: userId })));

      if (insertError) throw new Error(insertError.message);

      // Step 2: Trigger briefing generation
      const res = await fetch("/api/briefings/generate", { method: "POST" });

      // Clear scheduled timers
      timersRef.current.forEach(clearTimeout);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to generate briefing. Please try again.");
      }

      // Step 3: Show success briefly, then navigate to dashboard
      setProgressStep(4);
      await new Promise((r) => setTimeout(r, 1200));
      router.refresh();
    } catch (err) {
      timersRef.current.forEach(clearTimeout);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setGenerating(false);
    }
  }

  // ---------- Generating state ----------
  if (generating) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-24 min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center">
          {/* Animated logo */}
          <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse">
            <span className="font-serif font-bold text-4xl">B</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-primary mb-3">
            {PROGRESS_STEPS[progressStep]}
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto mb-8">
            {progressStep < 4
              ? "This usually takes about 15 seconds. We\u2019re searching the web and building your personalized briefing."
              : "Redirecting you to your Intelligence Feed\u2026"}
          </p>

          {/* Progress bar */}
          {progressStep < 4 && (
            <div className="w-64 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(((progressStep + 1) / 4) * 100, 95)}%`,
                }}
              />
            </div>
          )}

          {/* Success checkmark */}
          {progressStep === 4 && (
            <div className="w-12 h-12 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ---------- Topic selection state ----------
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 sm:py-24 min-h-[80vh] flex flex-col items-center justify-center">
      {/* X Ads signup conversion — fires once when fresh signup lands on onboarding */}
      <XSignupConversion email={userEmail} userId={userId} />

      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="font-serif font-bold text-3xl">B</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-primary tracking-tight mb-4">
          Build your briefing
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Pick the topics you care about. We&apos;ll search the web and deliver a personalized intelligence briefing straight to your inbox.
        </p>
      </div>

      <div className="w-full bg-card shadow-xl border border-border rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-primary" />

        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Selected topics chips */}
        {selectedTopics.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">
                Your Topics
              </h3>
              <span className="text-xs text-muted-foreground">
                {selectedTopics.length}/{maxTopics}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {topic}
                  <button
                    onClick={() => removeTopic(topic)}
                    className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                    aria-label={`Remove ${topic}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions grid */}
        <div className="mb-6">
          <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider mb-4 text-center sm:text-left">
            Suggested Topics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SUGGESTIONS.map((suggestion) => {
              const isSelected = selectedTopics.includes(suggestion);
              const isDisabled = !isSelected && selectedTopics.length >= maxTopics;
              return (
                <button
                  key={suggestion}
                  onClick={() => toggleSuggestion(suggestion)}
                  disabled={isDisabled}
                  className={`flex items-center justify-center h-12 rounded-xl text-sm font-semibold transition-all border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : isDisabled
                        ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                        : "bg-muted hover:bg-primary/5 text-primary border-border hover:border-primary/30"
                  }`}
                >
                  {isSelected ? (
                    <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="mr-1.5">+</span>
                  )}
                  <span className="truncate">{suggestion}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom topic input */}
        <div className="relative flex items-center py-3 mb-5">
          <div className="flex-grow border-t border-border" />
          <span className="flex-shrink-0 mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Or add your own
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCustomTopic();
          }}
          className="flex gap-3 mb-8"
        >
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g., Synthetic Biology, NFL, Enterprise SaaS\u2026"
            maxLength={100}
            disabled={selectedTopics.length >= maxTopics}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!customTopic.trim() || selectedTopics.length >= maxTopics}
            className="rounded-xl bg-muted px-5 py-3 text-sm font-semibold text-primary border border-border hover:bg-primary/5 hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </form>

        {/* CTA button */}
        <button
          onClick={handleGetBriefing}
          disabled={selectedTopics.length === 0}
          className={`w-full rounded-xl px-8 py-4 text-base font-bold transition-all shadow-md ${
            selectedTopics.length > 0
              ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary/20 cursor-pointer"
              : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
          }`}
        >
          {selectedTopics.length === 0
            ? "Select at least one topic to continue"
            : `Get your first briefing \u2192`}
        </button>

        {selectedTopics.length > 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            We&apos;ll search the web for the latest news on {selectedTopics.length === 1 ? "your topic" : `all ${selectedTopics.length} topics`} and send your first briefing to your inbox.
          </p>
        )}
      </div>
    </main>
  );
}
