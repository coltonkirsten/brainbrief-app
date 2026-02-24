"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function SubscribePage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [showComingSoon, setShowComingSoon] = useState(false);

  const price = billing === "monthly" ? "$6" : "$50";
  const period = billing === "monthly" ? "/month" : "/year";
  const savings = billing === "annual" ? "Save 30% vs. monthly" : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full gap-4 sm:gap-0">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight font-serif text-primary hover:opacity-90 transition-opacity"
        >
          Brain<span className="text-accent">Brief</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-12 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-serif text-primary tracking-tight">
            Upgrade to Brain Brief Pro
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Keep your daily intelligence briefings flowing.
            One plan, everything included, cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              billing === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-primary"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              billing === "annual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-primary"
            }`}
          >
            Annual
            <span className="ml-1.5 inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
              -30%
            </span>
          </button>
        </div>

        {/* Plan card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          {/* Price */}
          <div className="bg-muted border-b border-border px-8 py-10 text-center">
            <h2 className="text-lg font-bold font-serif text-primary mb-4">
              Brain Brief Pro
            </h2>
            <div className="flex items-end justify-center gap-1">
              <span className="text-5xl font-bold text-primary tracking-tight">
                {price}
              </span>
              <span className="text-muted-foreground font-medium pb-1">
                {period}
              </span>
            </div>
            {savings && (
              <p className="mt-3 text-sm text-accent font-semibold">
                {savings}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div className="px-8 py-8">
            <ul className="space-y-4 text-sm text-primary mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Up to 5 curated topics</strong>
                  <p className="text-muted-foreground mt-0.5">Track the industries, technologies, and trends that matter to you</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Daily personalized briefings</strong>
                  <p className="text-muted-foreground mt-0.5">AI-researched intelligence reports delivered to your inbox every morning</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>Deep-dive AI synthesis</strong>
                  <p className="text-muted-foreground mt-0.5">Grounded in real sources — Reuters, Bloomberg, TechCrunch, and more</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>On-demand briefings</strong>
                  <p className="text-muted-foreground mt-0.5">Generate a briefing anytime, not just on schedule</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong>No ads, no tracking, no data selling</strong>
                  <p className="text-muted-foreground mt-0.5">Your topics and data stay private, always</p>
                </div>
              </li>
            </ul>

            {/* CTA */}
            <button
              onClick={() => setShowComingSoon(true)}
              className="block w-full rounded-md bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground hover:bg-primary-hover transition-all shadow-sm"
            >
              {billing === "annual"
                ? "Subscribe — $50/year"
                : "Subscribe — $6/month"}
            </button>

            {showComingSoon && (
              <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-accent">
                  Payments launching soon!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  We&apos;re setting up secure payments with Stripe.
                  Your trial will be extended — you won&apos;t miss a briefing.
                </p>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-4">
              Cancel anytime. Secure payment via Stripe.
              {billing === "annual" && " Billed annually."}
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 space-y-6">
          <h3 className="text-lg font-bold font-serif text-primary text-center">
            Common questions
          </h3>
          <div className="space-y-4">
            <details className="group bg-card border border-border rounded-xl px-6 py-4">
              <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                What happens when my trial ends?
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Your daily briefings will pause, but your account and topics are saved.
                Subscribe anytime to pick up right where you left off — no setup needed.
              </p>
            </details>
            <details className="group bg-card border border-border rounded-xl px-6 py-4">
              <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                Can I cancel anytime?
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Yes — cancel with one click from your dashboard. No questions asked, no hidden fees.
                If you cancel, you&apos;ll keep access until the end of your billing period.
              </p>
            </details>
            <details className="group bg-card border border-border rounded-xl px-6 py-4">
              <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center justify-between">
                Is my payment information secure?
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Absolutely. Payments are processed by Stripe, the industry standard for secure payments.
                We never see or store your card details.
              </p>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
