import Link from "next/link";
import { CheckCircle2, Clock, Inbox, ArrowRight, BrainCircuit } from "lucide-react";
import BriefingCarousel from "./briefing-carousel";

export default function LandingPage() {
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

        {/* Briefing Carousel */}
        <BriefingCarousel />
      </main>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">
              Intelligence, automated.
            </h2>
            <p className="text-muted-foreground text-lg">
              We replace endless doomscrolling and cluttered RSS feeds with a single, highly-curated daily briefing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-muted border border-border text-primary flex items-center justify-center mb-6 shadow-sm">
                <Inbox className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-3 text-primary">1. Curate your focus</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Define the topics, industries, or companies that matter to you. We track thousands of sources globally to ensure nothing critical is missed.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-muted border border-border text-primary flex items-center justify-center mb-6 shadow-sm">
                <BrainCircuit className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-3 text-primary">2. AI synthesis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our proprietary engine distills hours of reading into high-signal summaries, identifying key trends and highlighting "The Bottom Line."
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-muted border border-border text-primary flex items-center justify-center mb-6 shadow-sm">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-3 text-primary">3. Read in minutes</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Receive a beautifully formatted, editorial-grade email on your schedule. Reclaim your time and attention without sacrificing awareness.
              </p>
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
