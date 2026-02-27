"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Zap } from "lucide-react";

const BRIEFINGS = [
  {
    tag: "Artificial Intelligence",
    headline: "The shift from chatbots to autonomous agents accelerates",
    synthesis:
      "Major AI labs have signaled a pivot toward autonomous agents capable of long-horizon planning and execution. This represents a fundamental shift from zero-shot chat interfaces to persistent, goal-oriented systems.",
  },
  {
    tag: "Formula 1",
    headline: "Aerodynamic regulations set to drastically alter 2026 grid",
    synthesis:
      "The FIA\u2019s finalized 2026 aero package introduces active aerodynamics and smaller, lighter chassis. Teams are already shifting wind-tunnel resources, betting that mastering the new drag-reduction systems will dictate early championship dominance.",
  },
  {
    tag: "Climate Tech",
    headline: "Next-generation solid-state batteries reach commercial viability",
    synthesis:
      "Recent breakthroughs in solid-state electrolyte stability have pushed energy density past 500 Wh/kg. Automakers are accelerating production timelines, signaling a near-term disruption to traditional lithium-ion supply chains.",
  },
  {
    tag: "Renaissance Art",
    headline:
      "Newly discovered sketches challenge timeline of Da Vinci\u2019s late period",
    synthesis:
      "Archival unearthings in Milan suggest Leonardo\u2019s transition into his late sfumato technique occurred a decade earlier than historically accepted. The sketches reveal a master rapidly prototyping shadow gradients previously thought impossible.",
  },
  {
    tag: "Venture Capital",
    headline: "Seed rounds swell as firms bypass crowded Series A markets",
    synthesis:
      "Top-tier funds are deploying unprecedented capital into pre-product seed rounds to secure ownership early. This strategy aims to bypass the highly competitive, inflated valuations currently bottlenecking the Series A landscape.",
  },
];

const INTERVAL_MS = 5000;
const FADE_MS = 400;

export default function BriefingCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (index === activeIndex || fading) return;
      setFading(true);
      setTimeout(() => {
        setActiveIndex(index);
        setFading(false);
        setProgress(0);
      }, FADE_MS / 2);
    },
    [activeIndex, fading]
  );

  const advance = useCallback(() => {
    goTo((activeIndex + 1) % BRIEFINGS.length);
  }, [activeIndex, goTo]);

  // Auto-advance timer
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    const progressStep = 50; // update every 50ms
    progressRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + progressStep / INTERVAL_MS * 100, 100));
    }, progressStep);

    timerRef.current = setInterval(() => {
      advance();
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, advance]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  const briefing = BRIEFINGS[activeIndex];

  return (
    <div
      className="mt-24 relative mx-auto w-full max-w-4xl text-left hidden sm:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) {
          if (diff < 0) {
            goTo((activeIndex + 1) % BRIEFINGS.length);
          } else {
            goTo((activeIndex - 1 + BRIEFINGS.length) % BRIEFINGS.length);
          }
        }
        touchStartX.current = null;
      }}
    >
      {/* Glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-border via-accent/20 to-border rounded-2xl blur opacity-30" />

      {/* Card */}
      <div className="relative bg-card shadow-xl border border-border rounded-xl p-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <div className="text-xl font-bold tracking-tight font-serif text-primary">
            Brain<span className="text-accent">Brief</span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Your Daily Intelligence
          </div>
        </div>

        {/* Content with cross-fade */}
        <div
          className="transition-all"
          style={{
            opacity: fading ? 0 : 1,
            filter: fading ? "blur(2px)" : "blur(0px)",
            transitionDuration: `${FADE_MS / 2}ms`,
          }}
        >
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block px-2.5 py-1 rounded-md bg-muted text-primary text-[10px] font-bold uppercase tracking-wider">
                  {briefing.tag}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary mb-4 leading-snug">
                {briefing.headline}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {briefing.synthesis}
              </p>
            </div>
            <div className="md:col-span-1 border-l border-border pl-8">
              <div className="p-5 bg-muted/50 rounded-lg border border-border h-full flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3 text-accent">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    The Bottom Line
                  </span>
                </div>
                <p className="text-sm font-serif italic text-primary leading-relaxed">
                  {briefing.synthesis.split(". ").slice(-1)[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Topic tags navigation */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 flex-wrap">
          {BRIEFINGS.map((b, i) => (
            <button
              key={b.tag}
              onClick={() => goTo(i)}
              className={`relative px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all overflow-hidden ${
                i === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80"
              }`}
            >
              {/* Progress bar on active tag */}
              {i === activeIndex && (
                <span
                  className="absolute bottom-0 left-0 h-[2px] bg-accent transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
              {b.tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
