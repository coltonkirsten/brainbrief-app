-- Topic feedback table — stores per-topic, per-briefing feedback from email links
-- Ratings: too_basic, spot_on, go_deeper
-- UNIQUE constraint ensures one rating per user per topic per briefing (idempotent upsert)

CREATE TABLE IF NOT EXISTS topic_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('too_basic', 'spot_on', 'go_deeper')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id, briefing_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_feedback_user_id ON topic_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_feedback_briefing_id ON topic_feedback(briefing_id);

ALTER TABLE topic_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON topic_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON topic_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback" ON topic_feedback
  FOR UPDATE USING (auth.uid() = user_id);
