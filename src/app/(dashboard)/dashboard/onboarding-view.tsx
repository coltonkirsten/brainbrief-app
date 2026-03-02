"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface OnboardingViewProps {
  userId: string;
}

export default function OnboardingView({ userId }: OnboardingViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    "Artificial Intelligence", 
    "SpaceX & NASA", 
    "Venture Capital", 
    "Clean Energy", 
    "Neuroscience", 
    "Design Systems"
  ];

  async function handleAdd(topicName: string) {
    if (!topicName.trim() || loading) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("topics")
      .insert({ name: topicName.trim(), user_id: userId });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Success! Refresh the page.
    router.refresh();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 sm:py-24 min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="font-serif font-bold text-3xl">B</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-primary tracking-tight mb-4">
          Build your briefing
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Select the topics you care about. We'll cut through the noise and deliver high-signal synthesis directly to your inbox.
        </p>
      </div>

      <div className="w-full bg-card shadow-xl border border-border rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-primary"></div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider mb-4 text-center sm:text-left">Quick Start</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={(e) => { e.preventDefault(); handleAdd(suggestion); }}
                disabled={loading}
                className="flex items-center justify-center h-14 bg-muted hover:bg-primary/5 text-primary border border-border hover:border-primary/30 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center py-4 mb-6">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">Or enter your own</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleAdd(newTopic); }} 
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="e.g., Synthetic Biology, NFL, Enterprise SaaS..."
            className="flex-1 rounded-xl border border-border bg-background px-5 py-4 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !newTopic.trim()}
            className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue →"}
          </button>
        </form>
      </div>
    </main>
  );
}