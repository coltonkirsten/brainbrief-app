/**
 * Trial and subscription status helpers.
 *
 * Business model:
 * - 7-day free trial (up to 3 topics, daily briefings)
 * - After trial: briefings stop, account persists
 * - Brain Brief Pro ($6/mo or $50/yr): up to 10 topics, daily briefings
 */

export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_TOPIC_LIMIT = 3;
export const PRO_TOPIC_LIMIT = 10;

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export interface TrialInfo {
  /** Whether the user can generate/receive briefings */
  canGenerateBriefings: boolean;
  /** Whether the user can add new topics */
  canAddTopics: boolean;
  /** Maximum number of topics allowed */
  maxTopics: number;
  /** Current subscription status */
  subscriptionStatus: SubscriptionStatus;
  /** Whether the user is on a paid plan */
  isSubscriber: boolean;
  /** Whether the trial is still active (not expired) */
  isTrialActive: boolean;
  /** Whether the trial has expired */
  isTrialExpired: boolean;
  /** Days remaining in trial (0 if expired or subscriber) */
  trialDaysRemaining: number;
  /** Day number in trial (1-7, capped at 7) */
  trialDayNumber: number;
}

/**
 * Compute trial/subscription status from a user's profile.
 */
export function getTrialInfo(profile: {
  trial_ends_at: string | null;
  subscription_status: string;
}): TrialInfo {
  const subscriptionStatus = (profile.subscription_status || "trialing") as SubscriptionStatus;
  const isSubscriber = subscriptionStatus === "active";

  // Parse trial end date
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const now = new Date();

  // Trial status
  const isTrialActive = trialEndsAt ? now < trialEndsAt : false;
  const isTrialExpired = trialEndsAt ? now >= trialEndsAt : true; // No trial_ends_at = expired

  // Days remaining (for countdown in emails)
  const msRemaining = trialEndsAt ? trialEndsAt.getTime() - now.getTime() : 0;
  const trialDaysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  // Day number (1-indexed, for "Day X of 7")
  const trialDayNumber = trialEndsAt
    ? Math.min(
        TRIAL_DURATION_DAYS,
        Math.max(1, TRIAL_DURATION_DAYS - trialDaysRemaining + 1)
      )
    : TRIAL_DURATION_DAYS;

  // Access rules
  // past_due = payment failed but Stripe is still retrying (grace period ~7 days)
  // Users should keep getting briefings during the retry window
  const isPastDue = subscriptionStatus === "past_due";
  const canGenerateBriefings = isSubscriber || isTrialActive || isPastDue;
  const canAddTopics = isSubscriber || isTrialActive || isPastDue;
  // past_due subscribers keep Pro limits during Stripe retry window
  const maxTopics = (isSubscriber || isPastDue) ? PRO_TOPIC_LIMIT : TRIAL_TOPIC_LIMIT;

  return {
    canGenerateBriefings,
    canAddTopics,
    maxTopics,
    subscriptionStatus,
    isSubscriber,
    isTrialActive,
    isTrialExpired,
    trialDaysRemaining,
    trialDayNumber,
  };
}
