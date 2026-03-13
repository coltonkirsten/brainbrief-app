import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTrialInfo } from "@/lib/trial";
import DeleteAccountButton from "./delete-account-button";
import ManageBillingButton from "./manage-billing-button";

export const metadata = {
  title: "Account | Brain Brief",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "trial_ends_at, subscription_status, plan_type, current_period_end, stripe_customer_id, stripe_subscription_id, created_at"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const trialInfo = getTrialInfo(
    profile ?? { trial_ends_at: null, subscription_status: "trialing" }
  );

  // Compute plan display label
  let planLabel = "Free Trial";
  let planDetail = "";
  const isCanceled = profile?.subscription_status === "canceled";

  // Parse current_period_end — stored as ISO string in DB (NOT a Unix timestamp)
  function formatPeriodEnd(): string {
    if (!profile?.current_period_end) return "";
    const periodEnd = new Date(profile.current_period_end);
    if (isNaN(periodEnd.getTime())) return "";
    return periodEnd.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (isCanceled) {
    const planType = profile?.plan_type;
    planLabel = "Canceled";
    const endDate = formatPeriodEnd();
    planDetail = endDate
      ? `Your ${planType === "annual" ? "annual" : "monthly"} subscription was canceled. Access ended ${endDate}.`
      : "Your subscription has been canceled.";
  } else if (trialInfo.isSubscriber || profile?.subscription_status === "past_due") {
    const planType = profile?.plan_type;
    planLabel = planType === "annual" ? "Pro Annual" : "Pro Monthly";
    const endDate = formatPeriodEnd();
    if (endDate) {
      planDetail = `Current period ends ${endDate}`;
    }
    if (profile?.subscription_status === "past_due") {
      planDetail += " (payment past due — updating payment method recommended)";
    }
  } else if (trialInfo.isTrialActive) {
    planLabel = "Free Trial";
    planDetail = `${trialInfo.trialDaysRemaining} day${trialInfo.trialDaysRemaining !== 1 ? "s" : ""} remaining`;
  } else if (trialInfo.isTrialExpired) {
    planLabel = "Trial Expired";
    planDetail = "Subscribe to resume your daily briefings";
  }

  const createdAt = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight font-serif text-primary hover:opacity-90 transition-opacity"
          >
            Brain<span className="text-accent">Brief</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary tracking-tight">
            Account
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage your account settings and subscription.
          </p>
        </div>

        {/* ── Section 1: Account Info ── */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            Account Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Member Since
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {createdAt}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current Plan
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    trialInfo.isSubscriber
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : isCanceled
                        ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                        : trialInfo.isTrialActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                  }`}
                >
                  {planLabel}
                </span>
                {planDetail && (
                  <span className="text-sm text-muted-foreground">
                    — {planDetail}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Subscription Management ── */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            Subscription
          </h2>

          {trialInfo.isSubscriber || profile?.subscription_status === "past_due" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You&apos;re on <strong className="text-foreground">{planLabel}</strong>.
                Manage your subscription, update payment method, or view invoices
                through the Stripe Customer Portal.
              </p>
              <ManageBillingButton />
            </div>
          ) : isCanceled ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Your subscription has been canceled
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  You no longer have access to daily briefings. Resubscribe anytime to pick up where you left off.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/subscribe"
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
                >
                  Resubscribe — $6/mo
                </Link>
                {profile?.stripe_customer_id && <ManageBillingButton />}
              </div>
            </div>
          ) : trialInfo.isTrialActive ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You have <strong className="text-foreground">{trialInfo.trialDaysRemaining} day{trialInfo.trialDaysRemaining !== 1 ? "s" : ""}</strong> left
                in your free trial. Subscribe now to keep your briefings.
              </p>
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
              >
                Upgrade to Pro — $6/mo
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your trial has ended. Subscribe to resume your daily briefings.
              </p>
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
              >
                Subscribe — $6/mo
              </Link>
            </div>
          )}
        </section>

        {/* ── Section 3: Support ── */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
            Support
          </h2>
          <p className="text-sm text-muted-foreground">
            Questions, feedback, or issues? We&apos;re here to help.
          </p>
          <a
            href="mailto:support@brainbrief.app"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            support@brainbrief.app
          </a>
        </section>

        {/* ── Section 4: Delete Account ── */}
        <section className="bg-card border border-red-200 dark:border-red-800/50 rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <DeleteAccountButton />
        </section>
      </main>
    </div>
  );
}
