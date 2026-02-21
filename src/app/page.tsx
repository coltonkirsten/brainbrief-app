import Link from "next/link";
import { CheckCircle2, Clock, Inbox, Zap, ArrowRight, BrainCircuit } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-accent/20">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tight font-serif text-primary">
          Brain<span className="text-accent">Brief</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-all"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
            Now open for early access
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl font-serif leading-tight text-primary">
            The antidote to <br className="hidden sm:block" />
            <span className="italic font-light text-slate-600">information overload.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Brain Brief delivers sophisticated, AI-generated intelligence briefings
            straight to your inbox. Pick your topics, filter the noise, and
            get smarter about what matters most.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-medium text-white hover:bg-primary-hover transition-all shadow-sm"
            >
              Start your 14-day free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-muted-foreground sm:ml-4 mt-4 sm:mt-0">
              No credit card required.
            </p>
          </div>
        </div>

        {/* Editorial Preview Card */}
        <div className="mt-24 relative mx-auto w-full max-w-4xl text-left hidden sm:block">
          <div className="absolute -inset-1 bg-gradient-to-r from-border via-accent/20 to-border rounded-2xl blur opacity-30"></div>
          <div className="relative bg-white shadow-xl border border-border rounded-xl p-10 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
              <div className="text-xl font-bold tracking-tight font-serif text-primary">
                Brain<span className="text-accent">Brief</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Your Daily Intelligence
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-primary text-[10px] font-bold uppercase tracking-wider">Artificial Intelligence</span>
                    <span className="text-xs text-muted-foreground">4 min read</span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-primary mb-4 leading-snug">The shift from chatbots to autonomous agents accelerates</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Major AI labs have signaled a pivot toward autonomous agents capable of long-horizon planning and execution. This represents a fundamental shift from zero-shot chat interfaces to persistent, goal-oriented systems.
                  </p>
                  <ul className="space-y-3 text-primary text-sm">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"></div>
                      <span>New architectures prioritize system-2 thinking, allowing models to verify their own steps before output.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"></div>
                      <span>Enterprise integration focuses on tools that map complex internal workflows rather than simple text generation.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:col-span-1 border-l border-border pl-8">
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100 h-full">
                  <div className="flex items-center gap-2 mb-3 text-accent">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">The Bottom Line</span>
                  </div>
                  <p className="text-sm font-serif italic text-primary leading-relaxed">
                    The era of prompt engineering is giving way to system engineering. Companies investing solely in chat-based interfaces risk falling behind competitors deploying multi-agent architectures that execute complex operational tasks autonomously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 bg-white border-y border-border">
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
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-border text-primary flex items-center justify-center mb-6 shadow-sm">
                <Inbox className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-3 text-primary">1. Curate your focus</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Define the topics, industries, or companies that matter to you. We track thousands of sources globally to ensure nothing critical is missed.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-border text-primary flex items-center justify-center mb-6 shadow-sm">
                <BrainCircuit className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-3 text-primary">2. AI synthesis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our proprietary engine distills hours of reading into high-signal summaries, identifying key trends and highlighting "The Bottom Line."
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-border text-primary flex items-center justify-center mb-6 shadow-sm">
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

      {/* Social Proof */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-12">
            Trusted by professionals who value their time
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white shadow-sm border border-border rounded-xl p-8 text-left">
              <p className="text-base text-primary font-serif italic mb-6 leading-relaxed">
                &ldquo;I used to spend an hour every morning scanning headlines and newsletters. Now I get exactly what I need to know in a 3-minute read. It's completely changed my morning routine.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-primary">
                  AM
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Alex M.</p>
                  <p className="text-xs text-muted-foreground">Product Director</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm border border-border rounded-xl p-8 text-left">
              <p className="text-base text-primary font-serif italic mb-6 leading-relaxed">
                &ldquo;The signal-to-noise ratio is unmatched. Brain Brief manages to pull the most critical updates on my niche topics without the fluff of standard tech media.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-primary">
                  JR
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Jamie R.</p>
                  <p className="text-xs text-muted-foreground">Founding Engineer</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm border border-border rounded-xl p-8 text-left">
              <p className="text-base text-primary font-serif italic mb-6 leading-relaxed">
                &ldquo;Finally, an intelligence tool that respects my time. The 'Bottom Line' summaries are consistently insightful and give me exactly what I need for my executive meetings.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-primary">
                  SK
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Sam K.</p>
                  <p className="text-xs text-muted-foreground">Startup Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-white border-t border-border">
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
            <div className="bg-slate-50 shadow-lg border border-border rounded-2xl p-10 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                14-Day Free Trial
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold font-serif text-primary mb-2">Brain Brief Premium</h3>
                <div className="flex items-end justify-center gap-1 mt-4">
                  <span className="text-5xl font-bold text-primary tracking-tight">$6</span>
                  <span className="text-muted-foreground font-medium pb-1">/month</span>
                </div>
                <p className="mt-3 text-sm text-accent font-medium">
                  or $50/year (Save 30%)
                </p>
              </div>
              
              <ul className="space-y-4 text-sm text-primary mb-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  <span><strong>Unlimited topics</strong> and keywords</span>
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
                className="block w-full rounded-md bg-primary py-3.5 text-center text-sm font-medium text-white hover:bg-primary-hover transition-all shadow-sm"
              >
                Start free trial
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Cancel anytime. Secure payment via Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-slate-50 px-6 py-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold tracking-tight font-serif text-primary">
            Brain<span className="text-accent">Brief</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Brain Brief. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
