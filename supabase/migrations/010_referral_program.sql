-- Migration 010: Referral program
-- Adds referral tracking infrastructure

-- 1. Add referral columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(user_id);

-- 2. Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'signed_up',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by referrer
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);

-- 3. Generate referral codes for existing users
UPDATE profiles
SET referral_code = UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- 4. Update handle_new_user trigger to auto-generate referral code + track referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_user_id UUID;
  new_referral_code TEXT;
BEGIN
  -- Generate unique 8-char referral code
  new_referral_code := UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));

  -- Look up referrer by code if ref_code provided in metadata
  IF NEW.raw_user_meta_data->>'ref_code' IS NOT NULL AND NEW.raw_user_meta_data->>'ref_code' != '' THEN
    SELECT user_id INTO ref_user_id
    FROM public.profiles
    WHERE referral_code = UPPER(NEW.raw_user_meta_data->>'ref_code')
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    user_id, email, trial_ends_at, subscription_status,
    utm_source, utm_medium, utm_campaign, user_role, timezone,
    referral_code, referred_by
  )
  VALUES (
    NEW.id,
    NEW.email,
    NOW() + INTERVAL '7 days',
    'trialing',
    NEW.raw_user_meta_data->>'utm_source',
    NEW.raw_user_meta_data->>'utm_medium',
    NEW.raw_user_meta_data->>'utm_campaign',
    NEW.raw_user_meta_data->>'user_role',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'timezone', ''), 'America/New_York'),
    new_referral_code,
    ref_user_id
  );

  -- If referred by someone, create a referral tracking row
  IF ref_user_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, referred_email, status)
    VALUES (ref_user_id, NEW.id, NEW.email, 'signed_up');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS policies for referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own referrals (as referrer)
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid());

-- Service role can do everything (for cron/webhooks)
CREATE POLICY "Service role full access on referrals"
  ON referrals FOR ALL
  USING (true)
  WITH CHECK (true);
