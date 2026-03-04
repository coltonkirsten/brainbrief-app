import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopicManager from "./topic-manager";
import GenerateButton from "./generate-button";
import CheckoutSuccessBanner from "./checkout-success-banner";
import ManageBillingButton from "./manage-billing-button";
import DeliveryTimePicker from "./delivery-time-picker";
import { getTrialInfo } from "@/lib/trial";
import OnboardingView from "./onboarding-view";

export const metadata = {
  title: "Dashboard | Brain Brief",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's profile, topics, and latest briefing in parallel
  const [profileResult, topicsResult, briefingResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("trial_ends_at, subscription_status, preferred_time, timezone")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("topics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("briefings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const topics = topicsResult.data ?? [];
  const latestBriefing = briefingResult.data;
  const trialInfo = getTrialInfo(
    profileResult.data ?? { trial_ends_at: null, subscription_status: "trialing" }
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Link href="/" className="text-xl font-bold tracking-tight font-serif text-primary hover:opacity-90 transition-opacity">
            Brain<span className="text-accent">Brief</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3">
              {trialInfo.isTrialActive && !trialInfo.isSubscriber && (
                <Link
                  href="/subscribe"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                >
                  {trialInfo.trialDaysRemaining} days left — Upgrade
                </Link>
              )}
              {trialInfo.isTrialExpired && !trialInfo.isSubscriber && (
                <Link
                  href="/subscribe"
                  className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-200 transition-colors"
                >
                  Trial Expired — Subscribe
                </Link>
              )}
              {trialInfo.isSubscriber && (
                <>
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent border border-accent/20">
                    Pro
                  </span>
                  <ManageBillingButton />
                </>
              )}
              <span className="text-sm font-medium text-muted-foreground">{user.email}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Mobile trial/upgrade banner (hidden on desktop where header badge is visible) */}
      {!trialInfo.isSubscriber && (
        <div className="sm:hidden px-4 pt-4">
          {trialInfo.isTrialActive ? (
            <Link
              href="/subscribe"
              className="flex items-center justify-between rounded-lg bg-accent/5 border border-accent/20 px-4 py-3"
            >
              <span className="text-sm font-semibold text-accent">
                {trialInfo.trialDaysRemaining} day{trialInfo.trialDaysRemaining !== 1 ? "s" : ""} left in trial
              </span>
              <span className="text-xs font-bold text-accent">Upgrade →</span>
            </Link>
          ) : trialInfo.isTrialExpired ? (
            <Link
              href="/subscribe"
              className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 px-4 py-3"
            >
              <span className="text-sm font-semibold text-red-700">Trial expired</span>
              <span className="text-xs font-bold text-red-700">Subscribe →</span>
            </Link>
          ) : null}
        </div>
      )}

      {/* Checkout success banner (client component, shows only when ?checkout=success) */}
      <Suspense>
        <CheckoutSuccessBanner />
      </Suspense>

      {/* Main Content or Onboarding */}
      {topics.length === 0 ? (
        <OnboardingView userId={user.id} maxTopics={trialInfo.maxTopics} />
      ) : (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        <div className="lg:col-span-5 space-y-8 sm:space-y-10">
          
          {/* Trial status banner */}
          {trialInfo.isTrialExpired && !trialInfo.isSubscriber && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-bold text-red-900">
                    Your free trial has ended
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Subscribe to Brain Brief Premium to resume your daily briefings.
                  </p>
                </div>
                <a
                  href="/subscribe"
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white text-center hover:bg-red-700 transition-colors shadow-sm"
                >
                  Subscribe &mdash; $6/mo
                </a>
              </div>
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold font-serif text-primary tracking-tight">Intelligence Feed</h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Define the topics, industries, or events you want to track. We'll curate the most critical updates into your daily briefing.
            </p>
          </div>

          <TopicManager
            initialTopics={topics}
            userId={user.id}
            maxTopics={trialInfo.maxTopics}
            canAddTopics={trialInfo.canAddTopics}
          />

          {/* Delivery Schedule */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
              Delivery Schedule
            </h3>
            <DeliveryTimePicker
              userId={user.id}
              initialTime={profileResult.data?.preferred_time ?? "06:00"}
              timezone={profileResult.data?.timezone ?? "America/New_York"}
            />
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">On-Demand Briefing</h3>
            <GenerateButton
              hasTopics={topics.length > 0}
              lastBriefingAt={latestBriefing?.created_at ?? null}
              canGenerate={trialInfo.canGenerateBriefings}
            />
          </div>

          {/* Upgrade CTA for trial users */}
          {trialInfo.isTrialActive && !trialInfo.isSubscriber && (
            <div className="pt-6 border-t border-border">
              <Link
                href="/subscribe"
                className="block rounded-xl border border-accent/20 bg-accent/5 px-5 py-4 hover:bg-accent/10 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-primary">
                      Upgrade to Brain Brief Pro
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lock in your briefings — {trialInfo.trialDaysRemaining} day{trialInfo.trialDaysRemaining !== 1 ? "s" : ""} left in trial
                    </p>
                  </div>
                  <span className="text-accent group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {/* Latest briefing or upcoming briefing info */}
          <div className="sticky top-12">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
              Latest Archive
            </h2>
            {latestBriefing ? (
              <div className="bg-card shadow-xl shadow-slate-200/50 border border-border rounded-2xl overflow-hidden">
                <div className="bg-muted border-b border-border px-8 py-6 flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-primary">Today's Briefing</h2>
                  <span className="text-sm font-medium text-muted-foreground">
                    {new Date(latestBriefing.created_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                
                <div className="p-8">
                  {latestBriefing.topics_covered &&
                    Array.isArray(latestBriefing.topics_covered) && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {latestBriefing.topics_covered.map((topic: string) => (
                          <span
                            key={topic}
                            className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-primary border border-border uppercase tracking-wider"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  <div
                    className="prose prose-slate max-w-none text-base text-muted-foreground leading-relaxed break-words overflow-hidden"
                    dangerouslySetInnerHTML={{
                      __html: latestBriefing.content_html,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card shadow-sm border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl font-bold text-primary mb-3">Ready for your first briefing?</h2>
                <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Add your target topics on the left, then click <strong className="font-medium text-primary">Generate Briefing</strong> to receive your first curated intelligence report instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      )}
    </div>
  );
}

function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="post">
      <button
        type="submit"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
