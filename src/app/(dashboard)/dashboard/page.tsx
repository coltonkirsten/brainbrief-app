import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopicManager from "./topic-manager";
import GenerateButton from "./generate-button";

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

  // Fetch user's topics and latest briefing in parallel
  const [topicsResult, briefingResult] = await Promise.all([
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Your Topics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to 3 topics you want briefings on. We&apos;ll research the
            latest news and send you a summary.
          </p>
        </div>

        <TopicManager
          initialTopics={topics}
          userId={user.id}
          maxTopics={3}
        />

        {/* On-demand generate button */}
        <div className="mt-8">
          <GenerateButton
            hasTopics={topics.length > 0}
            lastBriefingAt={latestBriefing?.created_at ?? null}
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
            <div className="bg-card shadow-sm border border-dashed border-slate-200 rounded-xl p-6 text-center">
              <div className="mb-3 flex justify-center" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  <circle cx="18" cy="18" r="3" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h2 className="font-semibold">Your first briefing is coming!</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                Add topics above, then hit &quot;Send my briefing now&quot; to
                get your first briefing instantly — or wait for the daily email
                at 9am UTC.
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
