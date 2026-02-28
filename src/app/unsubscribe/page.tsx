"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function UnsubscribePage() {
  const [status, setStatus] = useState<"loading" | "confirm" | "done" | "error" | "not-logged-in">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email ?? null);
        setStatus("confirm");
      } else {
        setStatus("not-logged-in");
      }
    });
  }, []);

  async function handleUnsubscribe() {
    setStatus("loading");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        return;
      }

      // Deactivate all topics — this stops briefing generation
      const { error } = await supabase
        .from("topics")
        .update({ is_active: false })
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to deactivate topics:", error);
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight font-serif text-primary hover:opacity-90 transition-opacity inline-block mb-12"
        >
          Brain<span className="text-accent">Brief</span>
        </Link>

        {status === "loading" && (
          <div className="bg-card border border-border rounded-xl p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {status === "not-logged-in" && (
          <div className="bg-card border border-border rounded-xl p-8">
            <h1 className="text-2xl font-bold font-serif text-primary mb-4">Unsubscribe</h1>
            <p className="text-muted-foreground mb-6">
              Please log in to manage your email preferences.
            </p>
            <Link
              href="/login?redirect=/unsubscribe"
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all"
            >
              Log in
            </Link>
          </div>
        )}

        {status === "confirm" && (
          <div className="bg-card border border-border rounded-xl p-8">
            <h1 className="text-2xl font-bold font-serif text-primary mb-4">Unsubscribe from emails</h1>
            <p className="text-muted-foreground mb-2">
              This will stop all daily briefing emails for:
            </p>
            {email && (
              <p className="text-sm font-semibold text-primary mb-6">{email}</p>
            )}
            <p className="text-sm text-muted-foreground mb-8">
              Your account and topics will be saved — you can reactivate them anytime from your dashboard.
            </p>
            <button
              onClick={handleUnsubscribe}
              className="w-full rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 transition-all mb-3"
            >
              Unsubscribe from all emails
            </button>
            <Link
              href="/dashboard"
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Cancel — take me back
            </Link>
          </div>
        )}

        {status === "done" && (
          <div className="bg-card border border-border rounded-xl p-8">
            <h1 className="text-2xl font-bold font-serif text-primary mb-4">You&apos;ve been unsubscribed</h1>
            <p className="text-muted-foreground mb-6">
              You won&apos;t receive any more briefing emails. Your account and topics are still saved — come back anytime.
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all"
            >
              Go to dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="bg-card border border-border rounded-xl p-8">
            <h1 className="text-2xl font-bold font-serif text-primary mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t process your request. Please try again or contact us at{" "}
              <a href="mailto:support@brainbrief.app" className="text-accent hover:underline">
                support@brainbrief.app
              </a>.
            </p>
            <button
              onClick={() => setStatus("confirm")}
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
