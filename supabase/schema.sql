-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analysis_reports table
CREATE TABLE analysis_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  input_text TEXT NOT NULL,
  bias_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  categories JSONB NOT NULL DEFAULT '{}'::jsonb,
  flagged_phrases JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewritten_output JSONB NOT NULL DEFAULT '[]'::jsonb,
  diversity_impact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own reports
CREATE POLICY "Users can insert their own reports"
  ON analysis_reports FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to select their own reports
CREATE POLICY "Users can view their own reports"
  ON analysis_reports FOR SELECT
  USING (auth.uid()::text = user_id);
