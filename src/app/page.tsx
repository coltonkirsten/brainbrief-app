import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="text-xl font-bold tracking-tight">
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
              className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Pick your topics</h3>
              <p className="text-muted-foreground">
                AI, climate, sports, tech — whatever you care about. Add up to 3
                topics for free.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">We do the research</h3>
              <p className="text-muted-foreground">
                Our AI scours the web for the latest developments on your topics,
                powered by Google Gemini.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Get your briefing</h3>
              <p className="text-muted-foreground">
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
            <div className="rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;I used to spend 30 minutes scanning headlines. Now I get
                everything I need in a 2-minute email.&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium">— Early Beta User</p>
            </div>
            <div className="rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;The AI summaries are surprisingly good. Concise, accurate,
                and always up-to-date.&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium">— Early Beta User</p>
            </div>
            <div className="rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground italic">
                &ldquo;Finally, a news digest that covers exactly what I care
                about — nothing more, nothing less.&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium">— Early Beta User</p>
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
            <div className="rounded-xl border border-border bg-background p-8">
              <h3 className="text-lg font-semibold">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  Up to 3 topics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  Daily email briefings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  AI-powered summaries
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
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
            <div className="rounded-xl border-2 border-primary bg-background p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                Coming Soon
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  Unlimited topics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  Custom delivery schedule
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
                  Deeper briefings with more sources
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">&#10003;</span>
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
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-colors"
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
