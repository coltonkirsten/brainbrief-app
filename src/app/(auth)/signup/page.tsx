"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
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

const ROLE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "developer", label: "Developer / Engineer" },
  { value: "executive", label: "Executive / Manager" },
  { value: "entrepreneur", label: "Entrepreneur / Founder" },
  { value: "student", label: "Student / Researcher" },
  { value: "creator", label: "Creator / Freelancer" },
  { value: "other", label: "Other" },
] as const;

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Capture UTM params from URL (e.g., /signup?utm_source=twitter&utm_medium=social)
  const utmParams = useMemo(
    () => ({
      utm_source: searchParams.get("utm_source") || undefined,
      utm_medium: searchParams.get("utm_medium") || undefined,
      utm_campaign: searchParams.get("utm_campaign") || undefined,
    }),
    [searchParams]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation (styled, not browser-native)
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Build metadata — UTM params + optional role
    // These are stored in auth.users.raw_user_meta_data and read by the profile trigger
    const metadata: Record<string, string> = {};
    if (utmParams.utm_source) metadata.utm_source = utmParams.utm_source;
    if (utmParams.utm_medium) metadata.utm_medium = utmParams.utm_medium;
    if (utmParams.utm_campaign) metadata.utm_campaign = utmParams.utm_campaign;
    if (userRole) metadata.user_role = userRole;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: metadata,
      },
    });

    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  /** Map raw Supabase errors to user-friendly messages */
  function friendlyError(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes("email rate limit"))
      return "Too many attempts — please try again in a few minutes.";
    if (lower.includes("already registered") || lower.includes("already been registered"))
      return "An account with this email already exists. Try signing in instead.";
    if (lower.includes("password") && lower.includes("6"))
      return "Password must be at least 6 characters.";
    if (lower.includes("invalid") && lower.includes("email"))
      return "Please enter a valid email address.";
    return msg;
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <AuthNav />
        <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm text-center" role="status" aria-live="polite">
          <div className="mb-4 flex justify-center" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              <path d="M2 17 9 12" /><path d="M22 17 15 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Click
            it to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Back to login
          </Link>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNav />
      <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight font-serif text-primary">
            Brain<span className="text-accent">Brief</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your personal intelligence briefing starts here
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
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Optional role question */}
          <div>
            <label
              htmlFor="user-role"
              className="block text-sm font-medium mb-1.5"
            >
              What best describes you?{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <select
              id="user-role"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className={`w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                !userRole ? "text-muted-foreground" : ""
              }`}
            >
              <option value="" disabled>
                Choose one...
              </option>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-primary">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
