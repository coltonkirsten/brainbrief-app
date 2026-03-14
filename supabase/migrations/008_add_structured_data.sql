-- Migration 008: Add structured_data column to briefings
-- Stores TopicBriefing[] JSON for rendering on landing page carousel
-- Applied: 2026-03-14

ALTER TABLE briefings
ADD COLUMN IF NOT EXISTS structured_data JSONB;

COMMENT ON COLUMN briefings.structured_data IS 'Structured topic data (headlines, bullets, bottomLine, sources) for rich rendering';
