import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CATEGORY_ORDER,
  CATEGORY_DESCRIPTIONS,
  getTopicsByCategory,
  type TopicCategory,
} from "@/content/topics";

/**
 * Topics index page — /topics
 *
 * Category grid listing all available topic briefings.
 * Primary purpose: internal linking for SEO + discovery.
 */

export const metadata: Metadata = {
  title: "Daily Briefing Topics — Brain Brief",
  description:
    "Explore 50+ topics covered by Brain Brief. Get AI-powered daily briefings on technology, finance, science, health, politics, sports, and more — delivered to your inbox every morning.",
  keywords: [
    "daily news briefing topics",
    "AI news briefing",
    "personalized news digest",
    "brain brief topics",
  ],
  openGraph: {
    title: "Daily Briefing Topics — Brain Brief",
    description:
      "Explore 50+ topics. AI-powered daily briefings on tech, finance, science, health, politics, and more.",
    url: "https://www.brainbrief.app/topics",
    siteName: "Brain Brief",
    type: "website",
    images: [
      {
        url: "https://www.brainbrief.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brain Brief — Daily Briefing Topics",
      },
    ],
  },
  alternates: {
    canonical: "https://www.brainbrief.app/topics",
  },
};

// Category icons as simple colored dots (keeps it clean + lightweight)
const CATEGORY_COLORS: Record<TopicCategory, string> = {
  "Technology & AI": "bg-blue-500",
  "Business & Finance": "bg-emerald-500",
  "Science & Climate": "bg-purple-500",
  "Health & Wellness": "bg-rose-500",
  "Politics & Geopolitics": "bg-amber-500",
  "Culture & Sports": "bg-orange-500",
  "Niche & Emerging": "bg-teal-500",
};

export default function TopicsIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-sans text-lg font-bold text-primary tracking-tight"
          >
            Brain Brief
          </Link>
          <Link
            href="/signup?utm_source=topics&utm_medium=organic&utm_campaign=topics_index"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start free trial
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Page heading */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Daily Briefing Topics
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Explore 50+ topics covered by Brain Brief. Each page features a
            real AI-generated briefing updated daily — powered by the same
            Gemini + Google Search pipeline that subscribers receive every
            morning.
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-12">
          {CATEGORY_ORDER.map((category) => {
            const topics = getTopicsByCategory(category);
            if (topics.length === 0) return null;
            return (
              <section key={category}>
                <div className="mb-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[category]}`}
                    />
                    <h2 className="font-serif text-xl font-bold text-primary">
                      {category}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground ml-5">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-5">
                  {topics.map((topic) => (
                    <Link
                      key={topic.slug}
                      href={`/topics/${topic.slug}`}
                      className="group flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:border-accent/30 hover:shadow-md transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary text-sm group-hover:text-accent transition-colors">
                          {topic.name}
                        </h3>
                        <p className="text-muted-foreground text-xs mt-1 leading-relaxed line-clamp-2">
                          {topic.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent flex-shrink-0 mt-0.5 transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-card border border-border rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-3">
            Don&apos;t see your topic?
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-lg mx-auto leading-relaxed">
            Brain Brief subscribers can add{" "}
            <span className="font-semibold text-primary">any topic</span> —
            our AI will research it overnight and deliver a custom briefing to
            your inbox.
          </p>
          <Link
            href="/signup?utm_source=topics&utm_medium=organic&utm_campaign=custom_topic"
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground text-base font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
          >
            Start your free trial <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            7-day free trial &middot; No credit card required
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Brain Brief</p>
          <div className="flex gap-4">
            <Link
              href="/blog"
              className="hover:text-primary transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
