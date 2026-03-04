-- Migration 005: Auto-detect timezone from signup metadata
-- Previously, all users got 'America/New_York' by default regardless of location.
-- Now the signup trigger reads timezone from the browser's Intl API (passed via user_metadata).
-- The dashboard delivery time picker also auto-syncs timezone on load for existing users.

-- Update the trigger to capture timezone from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, email, trial_ends_at, subscription_status,
    utm_source, utm_medium, utm_campaign, user_role, timezone
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
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'timezone', ''), 'America/New_York')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
