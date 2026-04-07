import { createServerClient } from "@supabase/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, Zap } from "lucide-react";
import {
  getAllTopicSlugs,
  getTopicBySlug,
  getRelatedTopics,
} from "@/content/topics";

/**
 * Programmatic SEO topic page — /topics/{slug}
 *
 * Each topic gets its own landing page with a daily AI-generated briefing.
 * Purpose: organic search discovery, shareable URL, conversion funnel.
 *
 * Content is generated daily by the cron job and stored under the
 * sample user ID. ISR keeps pages fresh without full rebuilds.
 */

// Revalidate every hour — briefings are generated once daily
export const revalidate = 3600;

const SAMPLE_USER_ID = "0a1ee72f-2d65-4062-8c0b-db92305cae1d";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Static params for all topics ────────────────────────────────

export async function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

// ── Dynamic metadata per topic ──────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return {};

  const title = `Your Daily ${topic.name} Briefing — Brain Brief`;
  const description = `${topic.description} Get the latest ${topic.name.toLowerCase()} developments delivered to your inbox every morning. AI-powered, grounded in real sources.`;

  return {
    title,
    description,
    keywords: [
      topic.keyword,
      `${topic.name.toLowerCase()} news`,
      `${topic.name.toLowerCase()} briefing`,
      "brain brief",
      "AI news briefing",
      "daily briefing",
    ],
    openGraph: {
      title,
      description,
      url: `https://www.brainbrief.app/topics/${topic.slug}`,
      siteName: "Brain Brief",
      type: "article",
      images: [
        {
          url: "https://www.brainbrief.app/og-image.png",
          width: 1200,
          height: 630,
          alt: `${topic.name} — Brain Brief Daily Briefing`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Your Daily ${topic.name} Briefing`,
      description,
      images: ["https://www.brainbrief.app/og-image.png"],
    },
    alternates: {
      canonical: `https://www.brainbrief.app/topics/${topic.slug}`,
    },
  };
}

// ── Supabase helper ─────────────────────────────────────────────

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

// ── Types for structured briefing data ──────────────────────────

interface TopicBriefing {
  name: string;
  headline: string;
  bullets: string[];
  bottomLine: string;
  bulletSources?: { title: string; uri: string }[][];
}

interface StructuredData {
  greeting?: string;
  topics?: TopicBriefing[];
}

// ── Page component ──────────────────────────────────────────────

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const supabase = getSupabase();

  // Fetch the latest briefing that covers this topic.
  // Use .filter() with raw PostgREST cs. syntax because .contains()
  // doesn't properly encode JSONB arrays with spaces in strings.
  const { data: briefing } = await supabase
    .from("briefings")
    .select(
      "content_html, content_text, topics_covered, structured_data, subject_line, created_at, grounded"
    )
    .eq("user_id", SAMPLE_USER_ID)
    .filter("topics_covered", "cs", JSON.stringify([topic.name]))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const relatedTopics = getRelatedTopics(slug);

  // Extract the specific topic from structured_data if available
  let topicBriefing: TopicBriefing | null = null;
  if (briefing?.structured_data) {
    const structured = briefing.structured_data as StructuredData;
    topicBriefing =
      structured.topics?.find(
        (t) => t.name.toLowerCase() === topic.name.toLowerCase()
      ) || structured.topics?.[0] || null;
  }

  const briefingDate = briefing
    ? new Date(briefing.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // JSON-LD structured data for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topicBriefing?.headline ||
      briefing?.subject_line ||
      `Today's ${topic.name} Briefing`,
    description: topic.description,
    image: "https://www.brainbrief.app/og-image.png",
    datePublished: briefing?.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    dateModified: briefing?.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    author: {
      "@type": "Organization",
      name: "Brain Brief",
      url: "https://www.brainbrief.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Brain Brief",
      logo: {
        "@type": "ImageObject",
        url: "https://www.brainbrief.app/logo-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.brainbrief.app/topics/${topic.slug}`,
    },
    about: {
      "@type": "Thing",
      name: topic.name,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-sans text-lg font-bold text-primary tracking-tight"
          >
            Brain Brief
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/topics"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              All Topics
            </Link>
            <Link
              href={`/signup?utm_source=topics&utm_medium=organic&utm_campaign=${topic.slug}`}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get your own briefing
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page heading — SEO landing page copy */}
        <div className="mb-8">
          <Link
            href="/topics"
            className="inline-flex items-center text-sm text-accent font-bold uppercase tracking-wider mb-3 hover:text-accent/80 transition-colors"
          >
            {topic.category}
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
            Your Daily {topic.name} Briefing
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {topic.description} Get the latest {topic.name.toLowerCase()}{" "}
            developments delivered to your inbox every morning. AI-powered,
            personalized, and grounded in real sources.
          </p>
        </div>

        {/* Today's briefing */}
        {topicBriefing ? (
          <div className="bg-card shadow-xl shadow-slate-200/50 border border-border rounded-2xl overflow-hidden">
            {/* Card header */}
            <div className="bg-muted border-b border-border px-6 sm:px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent uppercase tracking-wider">
                  Today&apos;s Briefing
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {briefingDate}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              {/* Headline */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-6">
                {topicBriefing.headline}
              </h2>

              {/* Bullets */}
              <ul className="space-y-4 mb-6">
                {topicBriefing.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-2.5" />
                    <div>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {bullet}
                      </p>
                      {/* Per-bullet sources */}
                      {topicBriefing.bulletSources?.[i]?.length ? (
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {topicBriefing.bulletSources[i]
                            .filter((s) => s.uri)
                            .slice(0, 3)
                            .map((source, si) => (
                              <a
                                key={si}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {cleanDomain(source.title)}
                              </a>
                            ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Bottom Line */}
              {topicBriefing.bottomLine && (
                <div className="border-l-4 border-accent bg-muted rounded-r-lg p-4">
                  <p className="text-sm font-bold text-primary mb-1">
                    The Bottom Line
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {topicBriefing.bottomLine}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : briefing ? (
          /* Fallback: render raw HTML if structured data isn't available */
          <div className="bg-card shadow-xl shadow-slate-200/50 border border-border rounded-2xl overflow-hidden">
            <div className="bg-muted border-b border-border px-6 sm:px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent uppercase tracking-wider">
                  Today&apos;s Briefing
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {briefingDate}
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div
                className="prose prose-slate max-w-none text-base text-muted-foreground leading-relaxed break-words overflow-hidden"
                dangerouslySetInnerHTML={{ __html: briefing.content_html }}
              />
            </div>
          </div>
        ) : (
          /* No briefing yet */
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <Zap className="w-10 h-10 text-accent mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold text-primary mb-3">
                First briefing generating soon
              </h2>
              <p className="text-muted-foreground text-base mb-6">
                Our AI generates fresh {topic.name.toLowerCase()} briefings
                every morning using real-time source analysis. Check back
                shortly.
              </p>
              <Link
                href={`/signup?utm_source=topics&utm_medium=organic&utm_campaign=${topic.slug}`}
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Get notified when it&apos;s ready <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* CTA card */}
        <div className="mt-10 bg-card border border-border rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-3">
            Get {topic.name} in your inbox every morning
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-lg mx-auto leading-relaxed">
            Join readers who start their day with an AI-powered briefing on{" "}
            <span className="font-semibold text-primary">
              {topic.name.toLowerCase()}
            </span>{" "}
            and the topics they care about most — fully sourced and ready in 5
            minutes.
          </p>
          <Link
            href={`/signup?utm_source=topics&utm_medium=organic&utm_campaign=${topic.slug}`}
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground text-base font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
          >
            Start your free trial <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            7-day free trial &middot; No credit card required
          </p>
        </div>

        {/* Related topics grid */}
        {relatedTopics.length > 0 && (
          <div className="mt-12 border-t border-border pt-10">
            <h3 className="font-serif text-xl font-bold text-primary mb-6">
              Related Briefings
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTopics.map((related) => (
                <Link
                  key={related.slug}
                  href={`/topics/${related.slug}`}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-primary text-sm mb-1.5 group-hover:text-accent transition-colors">
                    {related.name}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* How it works mini-section */}
        <div className="mt-10 border-t border-border pt-10">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-3">
                <span className="font-serif font-bold text-accent text-sm">
                  1
                </span>
              </div>
              <h3 className="font-semibold text-primary text-sm mb-1">
                Pick your topics
              </h3>
              <p className="text-muted-foreground text-sm">
                {topic.name}, plus anything else you follow
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-3">
                <span className="font-serif font-bold text-accent text-sm">
                  2
                </span>
              </div>
              <h3 className="font-semibold text-primary text-sm mb-1">
                We research overnight
              </h3>
              <p className="text-muted-foreground text-sm">
                AI synthesizes real-time sources while you sleep
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-3">
                <span className="font-serif font-bold text-accent text-sm">
                  3
                </span>
              </div>
              <h3 className="font-semibold text-primary text-sm mb-1">
                Read in 5 minutes
              </h3>
              <p className="text-muted-foreground text-sm">
                Cited, structured, no fluff — in your inbox every morning
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Brain Brief</p>
          <div className="flex gap-4">
            <Link
              href="/topics"
              className="hover:text-primary transition-colors"
            >
              All Topics
            </Link>
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

// ── Helpers ──────────────────────────────────────────────────────

/** Map common source domains to clean display names */
const DOMAIN_NAMES: Record<string, string> = {
  "reuters.com": "Reuters",
  "bbc.com": "BBC",
  "bbc.co.uk": "BBC",
  "nytimes.com": "NY Times",
  "washingtonpost.com": "Washington Post",
  "theguardian.com": "The Guardian",
  "cnbc.com": "CNBC",
  "bloomberg.com": "Bloomberg",
  "techcrunch.com": "TechCrunch",
  "theverge.com": "The Verge",
  "arstechnica.com": "Ars Technica",
  "wired.com": "Wired",
  "apnews.com": "AP News",
  "cnn.com": "CNN",
  "ft.com": "Financial Times",
  "wsj.com": "WSJ",
  "nature.com": "Nature",
  "science.org": "Science",
  "npr.org": "NPR",
  "axios.com": "Axios",
  "politico.com": "Politico",
};

function cleanDomain(title: string): string {
  if (!title) return "Source";
  const lower = title.toLowerCase().trim();
  // Check known domain mapping
  for (const [domain, name] of Object.entries(DOMAIN_NAMES)) {
    if (lower.includes(domain)) return name;
  }
  // Strip common TLDs and capitalize
  return title
    .replace(/\.(com|org|net|co\.uk|io)$/i, "")
    .replace(/^www\./i, "")
    .split(/[.-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
