-- User feedback table for /feedback page submissions
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (supports anonymous feedback from non-logged-in visitors)
CREATE POLICY "Anyone can insert feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (true);

-- No SELECT policy — only service role (which bypasses RLS) can read feedback
