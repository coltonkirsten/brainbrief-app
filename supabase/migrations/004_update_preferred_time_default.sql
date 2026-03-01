-- Migration: Update preferred_time default to 06:00 (6 AM local)
-- Date: 2026-03-01
-- Applied: 2026-03-01 (via pg8000)

-- Change default for new users
ALTER TABLE profiles ALTER COLUMN preferred_time SET DEFAULT '06:00';

-- Backfill all existing users (nobody has set this manually yet)
UPDATE profiles SET preferred_time = '06:00' WHERE preferred_time = '08:00';
