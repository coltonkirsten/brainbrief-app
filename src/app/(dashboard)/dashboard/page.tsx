import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopicManager from "./topic-manager";

export const metadata = {
  title: "Dashboard - Brain Brief",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's topics
  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-primary">Brain</span>Brief
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Your Topics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to 3 topics you want briefings on. We&apos;ll research the
            latest news and send you a summary.
          </p>
        </div>

        <TopicManager
          initialTopics={topics ?? []}
          userId={user.id}
          maxTopics={3}
        />

        {/* Upcoming briefing info */}
        <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
          <h2 className="font-semibold">Next briefing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your briefings are generated daily. Once you&apos;ve added topics,
            you&apos;ll receive your first briefing by email within 24 hours.
          </p>
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
