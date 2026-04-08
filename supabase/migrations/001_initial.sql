-- GovReview Initial Schema
-- Run with: supabase db push or psql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_document_type CHECK (
    document_type IN ('ai_policy', 'ai_governance', 'data_policy', 'data_framework', 'it_governance', 'other')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('uploaded', 'analyzing', 'complete', 'error')
  )
);

-- Uploaded documents linked to a review
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT 'txt',
  extracted_text TEXT,
  char_count INTEGER DEFAULT 0,
  document_type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent analysis results
CREATE TABLE agent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result_text TEXT,
  maturity_scores JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_agent_id CHECK (
    agent_id IN ('lead_consultant', 'data_ai_analyst', 'project_manager')
  ),
  CONSTRAINT valid_agent_status CHECK (
    status IN ('pending', 'running', 'complete', 'error')
  )
);

-- Generated reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  file_path TEXT,
  format TEXT NOT NULL DEFAULT 'docx',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_report_type CHECK (
    report_type IN ('current_state', 'gap_analysis', 'benchmarking', 'integrated', 'full')
  ),
  CONSTRAINT valid_format CHECK (
    format IN ('docx', 'pdf')
  )
);

-- Indexes for common queries
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_documents_review_id ON documents(review_id);
CREATE INDEX idx_agent_results_review_id ON agent_results(review_id);
CREATE INDEX idx_agent_results_agent_id ON agent_results(agent_id);
CREATE INDEX idx_reports_review_id ON reports(review_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (enable when using Supabase Auth)
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies (uncomment when auth is configured)
-- CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
