"use client";

import { useState, useCallback } from "react";
import { Gift, Copy, Check, Users } from "lucide-react";

interface ReferralCardProps {
  referralCode: string;
  referralCount: number;
  subscribedCount: number;
}

export default function ReferralCard({
  referralCode,
  referralCount,
  subscribedCount,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `https://www.brainbrief.app/signup?ref=${referralCode}&utm_source=referral&utm_medium=link&utm_campaign=friend`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS or unsupported browsers
      const input = document.createElement("input");
      input.value = referralUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralUrl]);

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
          Share Brain Brief
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Share your personal link with friends. When they sign up, we&apos;ll track it here.
      </p>

      {/* Copy link button */}
      <button
        onClick={copyLink}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left hover:border-accent/40 transition-colors group"
      >
        <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
          brainbrief.app/signup?ref={referralCode}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-accent shrink-0">
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </span>
      </button>

      {/* Referral stats */}
      {referralCount > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>
            <strong className="font-semibold text-primary">{referralCount}</strong>{" "}
            {referralCount === 1 ? "person" : "people"} signed up
            {subscribedCount > 0 && (
              <>
                {" "}&middot;{" "}
                <strong className="font-semibold text-accent">{subscribedCount}</strong>{" "}
                subscribed
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
