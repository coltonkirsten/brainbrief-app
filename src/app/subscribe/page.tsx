"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, Loader2, Sparkles, Crown } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  );
}

type Flow = "loading" | "trial-promo" | "upgrade" | "already-pro";

function SubscribeContent() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<Flow>("loading");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Not logged in — show trial promo (Flow A)
        setFlow("trial-promo");
        return;
      }

      // Logged in — check subscription status
      supabase
        .from("profiles")
        .select("subscription_status")
        .eq("user_id", session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          const status = data?.subscription_status;
          if (status === "active") {
            setFlow("already-pro");
          } else {
            // trialing, past_due, canceled, or null — show upgrade flow (Flow B)
            setFlow("upgrade");
          }
        });
    });
  }, []);

  const price = billing === "monthly" ? "$6" : "$50";
  const period = billing === "monthly" ? "/month" : "/year";
  const savings = billing === "annual" ? "Save 30% vs. monthly" : null;

  // Show message if returning from canceled checkout
  const checkoutStatus = searchParams.get("checkout");

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: billing }),
      });

      // If unauthorized, redirect to login with return URL
      if (res.status === 401) {
        router.push("/login?redirect=/subscribe");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL returned. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // Loading state while we determine the flow
  if (flow === "loading") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already a Pro subscriber — show info card
  if (flow === "already-pro") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar isLoggedIn={true} />
        <main className="max-w-2xl mx-auto px-6 pt-12 pb-32">
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden p-8 text-center">
            <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-serif text-primary mb-3">
              You&apos;re already a Pro subscriber
            </h1>
            <p className="text-muted-foreground mb-6">
              You have full access to Brain Brief Pro. Your briefings are active and your subscription is current.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover transition-all shadow-sm"
            >
              Back to dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isTrialPromo = flow === "trial-promo";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar isLoggedIn={!isTrialPromo} />

      <main className="max-w-2xl mx-auto px-6 pt-12 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-serif text-primary tracking-tight">
            {isTrialPromo ? "Start Your Free Trial" : "Upgrade to Brain Brief Pro"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {isTrialPromo
              ? "Try Brain Brief Pro free for 7 days. One plan, everything included, cancel anytime."
              : "Keep your daily intelligence briefings flowing. One plan, everything included, cancel anytime."}
          </p>
        </div>

        {/* Checkout status messages */}
        {checkoutStatus === "canceled" && (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-center">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Checkout was canceled. No charges were made.
            </p>
          </div>
        )}
        {checkoutStatus === "success" && (
          <div className="mb-8 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-3 text-center">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Welcome to Brain Brief Pro! Your subscription is active.
            </p>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              billing === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-primary"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              billing === "annual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-primary"
            }`}
          >
            Annual
            <span className="ml-1.5 inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
              Save 30%
            </span>
          </button>
        </div>

        {/* Plan card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden relative">
          {/* Trial badge — only for Flow A (new users) */}
          {isTrialPromo && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-bold text-accent uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                7-day free trial
              </span>
            </div>
          )}

          {/* Price */}
          <div className="bg-muted border-b border-border px-8 py-10 text-center">
            <h2 className="text-lg font-bold font-serif text-primary mb-4">
              Brain Brief Pro
            </h2>

            {isTrialPromo ? (
              /* Flow A: Trial pricing — $0 with strikethrough */
              <div className="flex flex-col items-center justify-center mt-2">
                <div className="flex items-baseline justify-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-muted-foreground line-through decoration-muted-foreground/50">{price}</span>
                  <span className="text-5xl font-bold text-accent tracking-tight">$0</span>
                </div>
                <p className="text-base font-bold text-primary mb-1">
                  for your first 7 days
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  then {price}{period}
                </p>
              </div>
            ) : (
              /* Flow B: Real pricing — no strikethrough, no $0 */
              <div className="flex flex-col items-center justify-center mt-2">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-primary tracking-tight">{price}</span>
                  <span className="text-lg text-muted-foreground font-medium">{period}</span>
                </div>
              </div>
            )}

            {savings && (
              <p className="mt-3 text-sm text-accent font-semibold">
                {savings}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div className="px-8 py-8">
            <ul className="space-y-4 text-sm text-primary mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Up to 10 curated topics</strong>
                  <p className="text-muted-foreground mt-0.5">Track the industries, technologies, and trends that matter to you</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Daily personalized briefings</strong>
                  <p className="text-muted-foreground mt-0.5">AI-researched intelligence reports delivered to your inbox every morning</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Deep-dive AI synthesis</strong>
                  <p className="text-muted-foreground mt-0.5">Grounded in real sources — Reuters, Bloomberg, TechCrunch, and more</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>On-demand briefings</strong>
                  <p className="text-muted-foreground mt-0.5">Generate a briefing anytime, not just on schedule</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>No ads, no tracking, no data selling</strong>
                  <p className="text-muted-foreground mt-0.5">Your topics and data stay private, always</p>
                </div>
              </li>
            </ul>

            {/* CTA */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-center">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-md bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground hover:bg-primary-hover transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : isTrialPromo ? (
                billing === "annual"
                  ? "Start free trial — $50/year after trial"
                  : "Start free trial — $6/month after trial"
              ) : (
                billing === "annual"
                  ? "Subscribe — $50/year"
                  : "Subscribe — $6/month"
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Cancel anytime. Secure payment via Stripe.
              {billing === "annual" && " Billed annually."}
            </p>
            <p className="text-center text-xs text-muted-foreground mt-2">
              By subscribing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 space-y-6">
          <h3 className="text-lg font-bold font-serif text-primary text-center">
            Common questions
          </h3>
          <div className="space-y-4">
            <details className="group bg-card border border-border rounded-xl px-6 py-4">
              <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                What happens when my trial ends?
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Your daily briefings will pause, but your account and topics are saved.
                Subscribe anytime to pick up right where you left off — no setup needed.
              </p>
            </details>
            <details className="group bg-card border border-border rounded-xl px-6 py-4">
              <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                Can I cancel anytime?
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Yes — cancel with one click from your dashboard. No questions asked, no hidden fees.
                If you cancel, you&apos;ll keep access until the end of your billing period.
              </p>
            </details>
            {isTrialPromo && (
              <details className="group bg-card border border-border rounded-xl px-6 py-4">
                <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                  Will I be charged during my free trial?
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  No. You get the full 7 days free. Your card is only charged when the trial ends.
                </p>
              </details>
            )}
            <details className="group bg-card border border-border rounded-xl px-6 py-4">
              <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                Is my payment information secure?
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Absolutely. Payments are processed by Stripe, the industry standard for secure payments.
                We never see or store your card details.
              </p>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full gap-4 sm:gap-0">
      <Link
        href="/"
        className="text-2xl font-bold tracking-tight font-serif text-primary hover:opacity-90 transition-opacity"
      >
        Brain<span className="text-accent">Brief</span>
      </Link>
      <Link
        href={isLoggedIn ? "/dashboard" : "/"}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {isLoggedIn ? "Back to dashboard" : "Back to home"}
      </Link>
    </nav>
  );
}
