"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function AuthNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full">
      <Link href="/" className="text-2xl font-bold tracking-tight font-serif text-primary">
        Brain<span className="text-accent">Brief</span>
      </Link>
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>
    </nav>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  /** Map raw Supabase error messages to user-friendly text */
  function friendlyError(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes("email rate limit") || lower.includes("rate limit"))
      return "Too many attempts — please try again in a few minutes.";
    if (lower.includes("invalid login credentials") || lower.includes("invalid credentials"))
      return "Incorrect email or password. (If you just signed up, please check your inbox to confirm your email).";
    if (lower.includes("email not confirmed"))
      return "Please confirm your email address before signing in. Check your inbox.";
    if (lower.includes("invalid") && lower.includes("email"))
      return "Please enter a valid email address.";
    return msg;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }

    setResetSent(true);
    setLoading(false);
  }

  // Password reset email sent — show confirmation
  if (resetSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthNav />
        <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm text-center" role="status" aria-live="polite">
          <div className="mb-4 flex justify-center" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Click
            it to set a new password.
          </p>
          <button
            onClick={() => {
              setResetSent(false);
              setResetMode(false);
            }}
            className="mt-6 inline-block text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Back to login
          </button>
        </div>
        </div>
      </div>
    );
  }

  // Forgot password form
  if (resetMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthNav />
        <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-bold tracking-tight font-serif text-primary">
              Brain<span className="text-accent">Brief</span>
            </Link>
            <h1 className="mt-6 text-2xl font-semibold">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium mb-1.5"
              >
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <button
              onClick={() => {
                setResetMode(false);
                setError(null);
              }}
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
        </div>
      </div>
    );
  }

  // Normal login form
  return (
    <div className="min-h-screen flex flex-col">
      <AuthNav />
      <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight font-serif text-primary">
            Brain<span className="text-accent">Brief</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetMode(true);
                  setError(null);
                }}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
              minLength={6}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
