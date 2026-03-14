"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

/**
 * Shape of a sample briefing passed from the server component.
 * Matches the structured_data stored in the briefings table.
 */
export interface SampleBriefing {
  topic: string;
  headline: string;
  bullets: string[];
  bottomLine: string;
  sources: { title: string; uri: string }[][];
  createdAt: string;
}

const INTERVAL_MS = 7000;
const FADE_MS = 400;

export default function LiveBriefingCarousel({
  briefings,
}: {
  briefings: SampleBriefing[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const count = briefings.length;

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
    goTo((activeIndex + 1) % count);
  }, [activeIndex, count, goTo]);

  // Auto-advance timer
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    const progressStep = 50;
    progressRef.current = setInterval(() => {
      setProgress(
        (prev) => Math.min(prev + (progressStep / INTERVAL_MS) * 100, 100)
      );
    }, progressStep);

    timerRef.current = setInterval(() => {
      advance();
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, advance]);

  // Reset progress on slide change
  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  if (count === 0) return null;

  const briefing = briefings[activeIndex];

  // Format the date nicely
  const dateStr = new Date(briefing.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Clean domain name from source title for display
  const cleanDomain = (title: string) => {
    return title
      .replace(/\.(com|org|net|co|io|gov|edu|uk|au)$/i, "")
      .replace(/^www\./i, "")
      .split(".")
      .pop()
      ?.replace(/^./, (c) => c.toUpperCase()) ?? title;
  };

  return (
    <div
      className="mt-16 sm:mt-24 relative mx-auto w-full max-w-4xl text-left"
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
            goTo((activeIndex + 1) % count);
          } else {
            goTo((activeIndex - 1 + count) % count);
          }
        }
        touchStartX.current = null;
      }}
    >
      {/* Glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-border via-accent/20 to-border rounded-2xl blur opacity-30" />

      {/* Card */}
      <div className="relative bg-card shadow-xl border border-border rounded-xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border px-6 sm:px-10 py-5">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold tracking-tight font-serif text-primary">
              Brain<span className="text-accent">Brief</span>
            </div>
            <span className="hidden sm:inline-block h-4 w-px bg-border" />
            <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest text-accent">
              Live
            </span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {dateStr}
          </div>
        </div>

        {/* Content area with cross-fade */}
        <div className="p-6 sm:p-10">
          <div
            className="transition-all"
            style={{
              opacity: fading ? 0 : 1,
              filter: fading ? "blur(2px)" : "blur(0px)",
              transitionDuration: `${FADE_MS / 2}ms`,
            }}
          >
            {/* Topic badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1.5 rounded-md bg-muted text-primary text-[10px] font-bold uppercase tracking-wider border border-border">
                {briefing.topic}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
              {/* Main content — 2/3 */}
              <div className="md:col-span-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-5 leading-snug">
                  {briefing.headline}
                </h2>

                <ul className="space-y-3">
                  {briefing.bullets.slice(0, 3).map((bullet, bi) => {
                    const bulletSources = briefing.sources[bi] ?? [];
                    const validSources = bulletSources.filter(
                      (s) => s.uri && s.uri.trim().length > 0
                    );
                    return (
                      <li
                        key={bi}
                        className="flex gap-3 text-sm text-muted-foreground leading-relaxed"
                      >
                        <span className="text-accent font-bold mt-0.5 shrink-0">
                          &bull;
                        </span>
                        <span>
                          {bullet}
                          {validSources.length > 0 && (
                            <span className="inline ml-1.5 text-xs text-slate-400">
                              [
                              {validSources.slice(0, 2).map((s, si) => (
                                <span key={si}>
                                  {si > 0 && ", "}
                                  <a
                                    href={s.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent/70 hover:text-accent underline underline-offset-2"
                                  >
                                    {cleanDomain(s.title)}
                                  </a>
                                </span>
                              ))}
                              ]
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Bottom Line sidebar — 1/3 */}
              <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-border pt-5 md:pt-0 pl-0 md:pl-8 mt-4 md:mt-0">
                <div className="p-5 bg-muted/50 rounded-lg border border-border h-full flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3 text-accent">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      The Bottom Line
                    </span>
                  </div>
                  <p className="text-sm font-serif italic text-primary leading-relaxed">
                    {briefing.bottomLine}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: topic tabs + CTA */}
        <div className="border-t border-border px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Topic tabs */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            {briefings.map((b, i) => (
              <button
                key={b.topic}
                onClick={() => goTo(i)}
                className={`relative px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all overflow-hidden ${
                  i === activeIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-primary hover:bg-muted/80"
                }`}
              >
                {i === activeIndex && (
                  <span
                    className="absolute bottom-0 left-0 h-[2px] bg-accent transition-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
                {b.topic}
              </button>
            ))}
          </div>

          {/* "This is real" badge */}
          <Link
            href="/sample"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors group"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            Generated today
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>
    </div>
  );
}
