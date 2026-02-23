-- Migration: Add Stripe subscription tracking columns to profiles
-- Run this in the Supabase SQL Editor: Dashboard → SQL Editor → New query
-- Date: 2026-02-23

-- Add Stripe subscription columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'annual'));

-- Update the handle_new_user trigger to use 7-day trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, trial_ends_at)
  VALUES (NEW.id, NEW.email, NOW() + INTERVAL '7 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
