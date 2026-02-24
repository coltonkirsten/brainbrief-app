"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { CheckCircle2, Loader2 } from "lucide-react";

/**
 * Client component that shows a success banner after Stripe Checkout,
 * then polls Supabase to detect when the webhook activates the subscription.
 *
 * Renders only when ?checkout=success is in the URL.
 */
export default function CheckoutSuccessBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"polling" | "activated" | "timeout">(
    "polling"
  );

  const isCheckoutSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    if (!isCheckoutSuccess) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let attempts = 0;
    const maxAttempts = 15; // 15 × 2s = 30 seconds
    const interval = 2000;

    const pollSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.subscription_status === "active") {
          setStatus("activated");
          // Refresh the server component data after a short delay
          // so the full page reflects the new subscription status
          setTimeout(() => {
            router.refresh();
          }, 500);
          return;
        }
      } catch {
        // Ignore polling errors, keep trying
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setStatus("timeout");
        return;
      }

      // Schedule next poll
      timerId = window.setTimeout(pollSubscription, interval);
    };

    let timerId = window.setTimeout(pollSubscription, interval);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isCheckoutSuccess, router]);

  if (!isCheckoutSuccess) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 pt-6">
      {status === "polling" && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0" />
            <div>
              <p className="text-sm font-bold text-primary">
                Welcome to Brain Brief Pro!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Activating your subscription — this usually takes a few
                seconds...
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "activated" && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-900 dark:text-green-100">
                You&apos;re all set! Brain Brief Pro is active.
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                Your daily intelligence briefings are locked in. No
                interruptions, ever.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "timeout" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Payment received!
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Your subscription is being processed. If it doesn&apos;t
                appear within a minute, try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
