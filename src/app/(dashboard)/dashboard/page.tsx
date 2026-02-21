import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopicManager from "./topic-manager";
import GenerateButton from "./generate-button";
import { getTrialInfo } from "@/lib/trial";

export const metadata = {
  title: "Dashboard",
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
      .select("trial_ends_at, subscription_status")
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-4xl mx-auto">
          <div className="text-xl font-bold tracking-tight font-sans">
            <span className="text-primary">Brain</span>Brief
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Trial status banner */}
        {trialInfo.isTrialActive && !trialInfo.isSubscriber && (
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-500/5 dark:border-indigo-500/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                <span className="font-semibold">Free trial</span> &mdash; Day {trialInfo.trialDayNumber} of {14}
                {trialInfo.trialDaysRemaining <= 3 && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                    ({trialInfo.trialDaysRemaining} day{trialInfo.trialDaysRemaining !== 1 ? "s" : ""} left)
                  </span>
                )}
              </p>
              <a
                href="/#pricing"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Upgrade to Pro &rarr;
              </a>
            </div>
          </div>
        )}

        {trialInfo.isTrialExpired && !trialInfo.isSubscriber && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Your free trial has ended
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Subscribe to Brain Brief Pro to resume your daily briefings.
                </p>
              </div>
              <a
                href="/#pricing"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Subscribe &mdash; $6/mo
              </a>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Your Topics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to {trialInfo.maxTopics} topics you want briefings on. We&apos;ll research the
            latest news and send you a summary.
          </p>
        </div>

        <TopicManager
          initialTopics={topics}
          userId={user.id}
          maxTopics={trialInfo.maxTopics}
          canAddTopics={trialInfo.canAddTopics}
        />

        {/* On-demand generate button */}
        <div className="mt-8">
          <GenerateButton
            hasTopics={topics.length > 0}
            lastBriefingAt={latestBriefing?.created_at ?? null}
            canGenerate={trialInfo.canGenerateBriefings}
          />
        </div>

        {/* Latest briefing or upcoming briefing info */}
        <div className="mt-8">
          {latestBriefing ? (
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Latest Briefing</h2>
                <span className="text-xs text-muted-foreground">
                  {new Date(latestBriefing.created_at).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
              {latestBriefing.topics_covered &&
                Array.isArray(latestBriefing.topics_covered) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {latestBriefing.topics_covered.map((topic: string) => (
                      <span
                        key={topic}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              <div
                className="prose prose-sm max-w-none text-sm text-muted-foreground break-words overflow-hidden"
                dangerouslySetInnerHTML={{
                  __html: latestBriefing.content_html,
                }}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 opacity-20"></div>
              <div className="mb-4 flex justify-center text-indigo-200 dark:text-indigo-900" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" fill="none" />
                  <polyline points="3 7 12 13 21 7" stroke="currentColor" fill="none" />
                </svg>
              </div>
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">Ready for your first briefing?</h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Add your favorite topics above, then hit <strong className="font-medium text-slate-700 dark:text-slate-300">&quot;Send my briefing now&quot;</strong> to receive your first curated intelligence report instantly.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="post">
      <button
        type="submit"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
