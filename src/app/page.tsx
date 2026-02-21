import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="text-xl font-bold tracking-tight font-sans">
          <span className="text-primary">Brain</span>Brief
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Get smarter about the things{" "}
            <span className="text-primary">you care about</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Brain Brief delivers personalized, AI-generated news briefings
            straight to your inbox. Pick your topics, set your schedule, and
            stay informed — effortlessly.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
            >
              Start for free
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-border px-8 py-3 text-base font-medium hover:bg-muted transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-sans mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Pick your topics</h3>
              <p className="text-muted-foreground text-sm">
                AI, climate, sports, tech — whatever you care about. Add up to 3
                topics for free.
              </p>
            </div>
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-sans mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">We do the research</h3>
              <p className="text-muted-foreground text-sm">
                Our AI scours the web for the latest developments on your topics,
                powered by Google Gemini.
              </p>
            </div>
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-sans mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Get your briefing</h3>
              <p className="text-muted-foreground text-sm">
                A clean, concise email briefing lands in your inbox on your
                schedule. No noise, just signal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
            Trusted by professionals who value their time
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-6">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;I used to spend 30 minutes scanning headlines. Now I get
                everything I need in a 2-minute email.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary font-sans">
                  AM
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Alex M.</p>
                  <p className="text-xs text-muted-foreground">Product Manager</p>
                </div>
              </div>
            </div>
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-6">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;The AI summaries are surprisingly good. Concise, accurate,
                and always up-to-date.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 justify-center">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-xs font-bold text-success font-sans">
                  JR
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Jamie R.</p>
                  <p className="text-xs text-muted-foreground">Software Engineer</p>
                </div>
              </div>
            </div>
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-6">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;Finally, a news digest that covers exactly what I care
                about — nothing more, nothing less.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary font-sans">
                  SK
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Sam K.</p>
                  <p className="text-xs text-muted-foreground">Startup Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple pricing
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
            Start free. Upgrade when you need more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="bg-card shadow-sm border border-slate-100 rounded-xl p-8">
              <h3 className="text-lg font-semibold">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-sans">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Up to 3 topics
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Daily email briefings
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  AI-powered summaries
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Web-grounded research
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full rounded-lg border border-border py-2.5 text-center text-sm font-semibold hover:bg-muted transition-colors"
              >
                Get started free
              </Link>
            </div>
            {/* Pro tier */}
            <div className="bg-card shadow-md border-2 border-primary rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                Coming Soon
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-sans">$6</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  or $50/year (save 30%)
                </p>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Unlimited topics
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Custom delivery schedule
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Deeper briefings with more sources
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Priority support
                </li>
              </ul>
              <button
                disabled
                className="mt-8 block w-full rounded-lg bg-primary/50 py-2.5 text-center text-sm font-semibold text-white cursor-not-allowed"
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold">
            Ready to get smarter?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join Brain Brief and start receiving personalized AI briefings — for
            free.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
          >
            Sign up free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Brain Brief. All rights reserved.</p>
      </footer>
    </div>
  );
}
