-- Add subject_line column to briefings table
-- Stores the dynamically generated email subject line for analytics
ALTER TABLE briefings ADD COLUMN IF NOT EXISTS subject_line TEXT;
