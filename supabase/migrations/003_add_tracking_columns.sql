-- Migration: Add customer tracking columns to profiles
-- Run this in the Supabase SQL Editor: Dashboard → SQL Editor → New query
-- Date: 2026-02-23

-- UTM tracking columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- User role/persona
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role TEXT;

-- Update trigger to capture UTM + role from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, email, trial_ends_at,
    utm_source, utm_medium, utm_campaign, user_role
  )
  VALUES (
    NEW.id,
    NEW.email,
    NOW() + INTERVAL '7 days',
    NEW.raw_user_meta_data->>'utm_source',
    NEW.raw_user_meta_data->>'utm_medium',
    NEW.raw_user_meta_data->>'utm_campaign',
    NEW.raw_user_meta_data->>'user_role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
