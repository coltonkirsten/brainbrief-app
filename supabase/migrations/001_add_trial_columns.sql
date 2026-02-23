-- Migration: Add trial tracking columns to profiles
-- Run this in the Supabase SQL Editor: Dashboard → SQL Editor → New query
-- Date: 2026-02-22

-- Add trial and subscription columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing';

-- Add check constraint for subscription_status
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_status_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check
            CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled'));
    END IF;
END $$;

-- Set trial_ends_at for all existing profiles that don't have it
UPDATE profiles SET trial_ends_at = NOW() + INTERVAL '7 days' WHERE trial_ends_at IS NULL;

-- Update the handle_new_user trigger to include trial_ends_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, trial_ends_at)
  VALUES (NEW.id, NEW.email, NOW() + INTERVAL '7 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
