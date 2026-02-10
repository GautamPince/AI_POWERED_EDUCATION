-- AI Question Generation System Database Schema
-- Migration: 003_ai_questions
-- Description: Tables for dynamic AI question generation, caching, and mentor review

-- ============================================================================
-- 1. AI Generated Questions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_generated_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Question Metadata
  exam_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'reasoning', 'comprehension')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT NOT NULL DEFAULT 'english',
  
  -- Question Content (JSONB for flexibility)
  content JSONB NOT NULL,
  /* Example MCQ structure:
  {
    "question": "What is 2+2?",
    "options": ["2", "3", "4", "5"],
    "correct_answer_index": 2,
    "explanation": "2+2 equals 4"
  }
  
  Example Numerical structure:
  {
    "question": "Calculate the area of a circle with radius 7cm",
    "answer": "154",
    "unit": "cm²",
    "explanation": "Using formula πr², area = 22/7 × 7 × 7 = 154 cm²"
  }
  */
  
  -- Quality & Review
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  quality_score DECIMAL(5,2), -- AI-generated confidence score (0-100)
  
  -- Usage Analytics
  times_used INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  avg_time_taken DECIMAL(10,2), -- seconds
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_topic ON ai_generated_questions(exam_name, topic);
CREATE INDEX IF NOT EXISTS idx_questions_status ON ai_generated_questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON ai_generated_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_type ON ai_generated_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_language ON ai_generated_questions(language);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_questions_exam_subject_topic 
  ON ai_generated_questions(exam_name, subject, topic, difficulty);

-- ============================================================================
-- 2. Question Generation Cache Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_generation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Cache identifier (hash of request parameters)
  cache_key TEXT UNIQUE NOT NULL,
  
  -- Cached question IDs
  question_ids UUID[] NOT NULL,
  
  -- Cache metadata
  hit_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Request context (for analytics)
  request_params JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_key ON question_generation_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON question_generation_cache(expires_at);

-- Auto-cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM question_generation_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. User Question Attempts Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  question_id UUID NOT NULL REFERENCES ai_generated_questions(id),
  
  -- Attempt data
  selected_answer_index INT,
  selected_answer_text TEXT, -- For numerical/text answers
  is_correct BOOLEAN,
  time_taken DECIMAL(10,2), -- seconds
  
  -- Context
  diagnostic_id UUID, -- Optional reference to diagnostic session
  study_session_id UUID, -- Optional reference to study session
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON user_question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON user_question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_diagnostic ON user_question_attempts(diagnostic_id);

-- ============================================================================
-- 4. Mentor Question Reviews Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentor_question_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES ai_generated_questions(id),
  mentor_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Review data
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'needs_revision')),
  feedback TEXT,
  suggested_changes JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(question_id, mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_question ON mentor_question_reviews(question_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor ON mentor_question_reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON mentor_question_reviews(status);

-- ============================================================================
-- 5. AI Generation Audit Log (for cost tracking and debugging)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_generation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request details
  request_params JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  
  -- Response details
  success BOOLEAN NOT NULL,
  questions_generated INT DEFAULT 0,
  error_message TEXT,
  
  -- Performance metrics
  cache_hit BOOLEAN DEFAULT FALSE,
  generation_time_ms INT,
  
  -- Cost tracking
  estimated_cost DECIMAL(10,4), -- In rupees
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON ai_generation_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON ai_generation_audit(user_id);

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE ai_generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_generation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_question_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_audit ENABLE ROW LEVEL SECURITY;

-- AI Generated Questions Policies
CREATE POLICY "Users can read approved questions"
  ON ai_generated_questions FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Mentors can read all questions"
  ON ai_generated_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'mentor'
    )
  );

CREATE POLICY "System can insert questions"
  ON ai_generated_questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Mentors can update question status"
  ON ai_generated_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'mentor'
    )
  );

-- User Attempts Policies
CREATE POLICY "Users can insert own attempts"
  ON user_question_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own attempts"
  ON user_question_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors can read all attempts"
  ON user_question_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'mentor'
    )
  );

-- Mentor Reviews Policies
CREATE POLICY "Mentors can crud own reviews"
  ON mentor_question_reviews FOR ALL
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

-- Cache Policies (system-only)
CREATE POLICY "System can manage cache"
  ON question_generation_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- Audit Policies (system and admin only)
CREATE POLICY "System can insert audit logs"
  ON ai_generation_audit FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 7. Helper Functions
-- ============================================================================

-- Function to update question usage statistics
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_generated_questions
  SET 
    times_used = times_used + 1,
    times_correct = times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    avg_time_taken = (
      COALESCE(avg_time_taken, 0) * times_used + NEW.time_taken
    ) / (times_used + 1)
  WHERE id = NEW.question_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats when user attempts a question
CREATE TRIGGER trigger_update_question_stats
  AFTER INSERT ON user_question_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_question_stats();

-- Function to get question performance metrics
CREATE OR REPLACE FUNCTION get_question_performance(question_uuid UUID)
RETURNS TABLE (
  total_attempts BIGINT,
  correct_attempts BIGINT,
  success_rate DECIMAL,
  avg_time DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_attempts,
    COUNT(*) FILTER (WHERE is_correct = true)::BIGINT as correct_attempts,
    ROUND(
      (COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
      2
    ) as success_rate,
    ROUND(AVG(time_taken), 2) as avg_time
  FROM user_question_attempts
  WHERE question_id = question_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Initial Data / Seed (Optional)
-- ============================================================================

-- Insert some example approved questions for fallback
-- (To be populated later with actual content)

COMMENT ON TABLE ai_generated_questions IS 'Stores all AI-generated questions with metadata and quality scores';
COMMENT ON TABLE question_generation_cache IS 'Caches question generation requests to reduce AI API costs';
COMMENT ON TABLE user_question_attempts IS 'Tracks user performance on AI-generated questions';
COMMENT ON TABLE mentor_question_reviews IS 'Stores mentor feedback and approval status for generated questions';
COMMENT ON TABLE ai_generation_audit IS 'Audit log for tracking AI generation requests, costs, and performance';
