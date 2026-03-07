"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
  { value: "content_quality", label: "Content Quality" },
  { value: "general", label: "General Feedback" },
] as const;

export default function FeedbackForm({
  userEmail,
}: {
  userEmail: string | null;
}) {
  const [category, setCategory] = useState<string>("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(userEmail ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <nav className="mb-12">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </nav>

          <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-serif text-primary mb-3">
              Thanks for your feedback!
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              We read every message. Your feedback helps us make Brain Brief
              better for everyone.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage("");
                  setCategory("general");
                }}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Submit another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <nav className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-primary tracking-tight">
            Share Your Feedback
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Have an idea, found a bug, or want to tell us what you think? We&apos;d
            love to hear from you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6"
        >
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-3">
              What kind of feedback?
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                    category === cat.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="feedback-message" className="block text-sm font-medium mb-1.5">
              Your feedback
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={5000}
              rows={6}
              placeholder="Tell us what's on your mind..."
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y min-h-[120px]"
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {message.length.toLocaleString()} / 5,000
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="feedback-email" className="block text-sm font-medium mb-1.5">
              Email <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              So we can follow up if needed. Not required.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || message.trim().length === 0}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending..." : "Send Feedback"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          You can also reach us at{" "}
          <a
            href="mailto:support@brainbrief.app"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            support@brainbrief.app
          </a>
        </p>
      </div>
    </div>
  );
}
