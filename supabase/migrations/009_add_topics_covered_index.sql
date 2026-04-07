-- Add GIN index on briefings.topics_covered for fast JSONB contains lookups.
-- Used by /topics/{slug} pages to find the latest briefing for a specific topic.
-- GIN index supports the @> (contains) operator efficiently.

CREATE INDEX IF NOT EXISTS idx_briefings_topics_covered
  ON briefings USING GIN (topics_covered);
