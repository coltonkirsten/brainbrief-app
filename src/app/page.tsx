import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import LiveBriefingCarousel from "./live-briefing-carousel";
import type { SampleBriefing } from "./live-briefing-carousel";
import BriefingCarousel from "./briefing-carousel";

// Revalidate every 5 minutes — sample briefings change daily
export const revalidate = 300;

const SAMPLE_USER_ID = "0a1ee72f-2d65-4062-8c0b-db92305cae1d";

/**
 * Fetch today's sample briefings from the database.
 * Returns structured data for the live carousel, or empty array
 * if no sample briefings exist yet (falls back to static carousel).
 */
async function getSampleBriefings(): Promise<SampleBriefing[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return [];

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });

    // Get the 3 most recent sample briefings (one per topic)
    const { data: briefings } = await supabase
      .from("briefings")
      .select(
        "topics_covered, structured_data, subject_line, created_at"
      )
      .eq("user_id", SAMPLE_USER_ID)
      .not("structured_data", "is", null)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!briefings || briefings.length === 0) return [];

    // Transform DB rows into SampleBriefing shape
    const results: SampleBriefing[] = [];

    for (const row of briefings) {
      const structured = row.structured_data as {
        topics?: {
          name: string;
          headline: string;
          bullets: string[];
          bottomLine: string;
          bulletSources?: { title: string; uri: string }[][];
        }[];
      } | null;

      if (!structured?.topics?.[0]) continue;

      const topic = structured.topics[0];
      results.push({
        topic: topic.name || (row.topics_covered as string[])?.[0] || "News",
        headline: topic.headline || row.subject_line || "Today's Briefing",
        bullets: topic.bullets || [],
        bottomLine: topic.bottomLine || "",
        sources: topic.bulletSources || [],
        createdAt: row.created_at,
      });
    }

    return results;
  } catch (err) {
    console.error("[landing] Failed to fetch sample briefings:", err);
    return [];
  }
}

export default async function LandingPage() {
  const sampleBriefings = await getSampleBriefings();
  const hasLiveData = sampleBriefings.length >= 2;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-accent/20">
      {/* Nav */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full gap-4 sm:gap-0">
        <Link href="/" className="text-2xl font-bold tracking-tight font-serif text-primary hover:opacity-90 transition-opacity">
          Brain<span className="text-accent">Brief</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
            Now open for early access
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl font-serif leading-tight text-primary">
            The antidote to <br className="hidden sm:block" />
            <span className="italic font-light text-muted-foreground">information overload.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Brain Brief delivers sophisticated, AI-generated intelligence briefings
            straight to your inbox. Pick your topics, filter the noise, and
            get smarter about what matters most.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary-hover transition-all shadow-sm"
            >
              Start your 7-day free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-muted-foreground sm:ml-4 mt-4 sm:mt-0">
              No credit card required.
            </p>
          </div>
        </div>

        {/* Briefing Carousel — live data when available, static fallback otherwise */}
        {hasLiveData ? (
          <LiveBriefingCarousel briefings={sampleBriefings} />
        ) : (
          <BriefingCarousel />
        )}
      </main>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-32 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-primary mb-6">
              How it works
            </h2>
            <p className="text-muted-foreground text-xl">
              We replace endless doomscrolling and cluttered RSS feeds with a single, highly-curated daily briefing.
            </p>
          </div>

          <div className="space-y-32">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
              <div className="flex-1 order-2 md:order-1 relative rounded-2xl overflow-hidden bg-background border border-border shadow-sm">
                <Image src="/hiw-step-1.png" alt="Pick your topics" width={800} height={600} className="w-full h-auto object-contain" />
              </div>
              <div className="flex-1 order-1 md:order-2">
                <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mb-6 shadow-sm">
                  <span className="font-serif font-bold text-accent text-lg">1</span>
                </div>
                <h3 className="font-serif font-bold text-3xl mb-4 text-primary">Pick what matters to you.</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Define the exact topics, industries, or companies you care about. We monitor thousands of live sources to ensure you never miss a critical signal.
                </p>
              </div>
            </div>

            {/* Step 2 (Centerpiece) */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mb-6 shadow-sm">
                  <span className="font-serif font-bold text-accent text-lg">2</span>
                </div>
                <h3 className="font-serif font-bold text-3xl mb-4 text-primary">We synthesize the day&apos;s news.</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our AI doesn&apos;t just summarize; it connects the dots. You get dense, fact-checked insights directly related to your chosen topics, fully cited so you can trust the source.
                </p>
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-background border border-border shadow-sm">
                <Image src="/hiw-step-2.png" alt="Email Briefing Example" width={800} height={600} className="w-full h-auto object-contain" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
              <div className="flex-1 order-2 md:order-1 relative rounded-2xl overflow-hidden bg-background border border-border shadow-sm">
                <Image src="/hiw-step-3.png" alt="Morning notification" width={800} height={600} className="w-full h-auto object-contain" />
              </div>
              <div className="flex-1 order-1 md:order-2">
                <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mb-6 shadow-sm">
                  <span className="font-serif font-bold text-accent text-lg">3</span>
                </div>
                <h3 className="font-serif font-bold text-3xl mb-4 text-primary">Ready before your first coffee.</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Delivered straight to your inbox every morning at 7:00 AM. Stop scrolling and start reading. Get smart, and get on with your day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">
              Premium intelligence, simply priced.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We believe in clear, transparent pricing. One plan, everything included.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-muted shadow-lg border border-border rounded-2xl p-10 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                7-Day Free Trial
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold font-serif text-primary mb-2">Brain Brief Premium</h3>
                <div className="flex flex-col items-center justify-center mt-4">
                  <div className="flex items-baseline justify-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-muted-foreground line-through decoration-muted-foreground/50">$6</span>
                    <span className="text-5xl font-bold text-accent tracking-tight">$0</span>
                  </div>
                  <p className="text-base font-bold text-primary mb-1">
                    for your first 7 days
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    then $6/month (or $50/year)
                  </p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-primary mb-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span><strong>Up to 10 topics</strong> and keywords</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span><strong>Daily personalized emails</strong> on your schedule</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span><strong>Deep-dive AI synthesis</strong> across thousands of sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span><strong>No ads, no tracking,</strong> no data selling</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full rounded-md bg-primary py-3.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-all shadow-sm"
              >
                Start free trial
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Cancel anytime. No credit card required to start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted px-6 py-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold tracking-tight font-serif text-primary">
            Brain<span className="text-accent">Brief</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Brain Brief. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
