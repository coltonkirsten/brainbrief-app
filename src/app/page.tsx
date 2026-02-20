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

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Brain Brief. All rights reserved.</p>
      </footer>
    </div>
  );
}
