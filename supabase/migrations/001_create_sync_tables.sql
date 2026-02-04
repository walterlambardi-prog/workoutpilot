-- WorkoutPilot Database Schema
-- Dual-Layer Storage: Supabase tables for persistent storage & sync
-- Run this migration in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. Exercise Sessions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  routine_id TEXT NULL,
  target_reps INTEGER NULL,
  reps INTEGER NOT NULL,
  started_at BIGINT NOT NULL,
  ended_at BIGINT NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_date 
  ON exercise_sessions(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_sessions_exercise 
  ON exercise_sessions(exercise_id);

CREATE INDEX IF NOT EXISTS idx_exercise_sessions_routine 
  ON exercise_sessions(routine_id) 
  WHERE routine_id IS NOT NULL;

-- ============================================================
-- 2. Routine Sessions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS routine_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rounds INTEGER NOT NULL,
  started_at BIGINT NOT NULL,
  completed_at BIGINT NULL,
  plan JSONB NOT NULL,
  step_results JSONB NOT NULL,
  total_reps INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_routine_sessions_user_date 
  ON routine_sessions(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_routine_sessions_completed 
  ON routine_sessions(user_id, completed_at DESC) 
  WHERE completed_at IS NOT NULL;

-- ============================================================
-- 3. Step Tracker Sessions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS step_tracker_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at BIGINT NOT NULL,
  ended_at BIGINT NOT NULL,
  duration_ms INTEGER NOT NULL,
  steps INTEGER NOT NULL,
  distance_km NUMERIC(10, 3) NOT NULL,
  positions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_step_tracker_sessions_user_date 
  ON step_tracker_sessions(user_id, started_at DESC);

-- ============================================================
-- 4. Routine Analyses Table (AI Cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS routine_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  overall_feedback TEXT NOT NULL,
  strengths TEXT[] NOT NULL,
  improvements TEXT[] NOT NULL,
  exercise_breakdown JSONB NOT NULL,
  next_steps TEXT[] NOT NULL,
  analyzed_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_routine_analysis UNIQUE (routine_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_routine_analyses_user 
  ON routine_analyses(user_id);

CREATE INDEX IF NOT EXISTS idx_routine_analyses_routine 
  ON routine_analyses(routine_id);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_tracker_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_analyses ENABLE ROW LEVEL SECURITY;

-- Exercise Sessions Policies
CREATE POLICY "Users can view own exercise sessions"
  ON exercise_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise sessions"
  ON exercise_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise sessions"
  ON exercise_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise sessions"
  ON exercise_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Routine Sessions Policies
CREATE POLICY "Users can view own routine sessions"
  ON routine_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routine sessions"
  ON routine_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routine sessions"
  ON routine_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routine sessions"
  ON routine_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Step Tracker Sessions Policies
CREATE POLICY "Users can view own step tracker sessions"
  ON step_tracker_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own step tracker sessions"
  ON step_tracker_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own step tracker sessions"
  ON step_tracker_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own step tracker sessions"
  ON step_tracker_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Routine Analyses Policies
CREATE POLICY "Users can view own routine analyses"
  ON routine_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routine analyses"
  ON routine_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routine analyses"
  ON routine_analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routine analyses"
  ON routine_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Triggers for automatic timestamp updates
-- ============================================================

CREATE OR REPLACE FUNCTION update_synced_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.synced_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exercise_sessions_synced_at
  BEFORE UPDATE ON exercise_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_synced_at();

CREATE TRIGGER update_routine_sessions_synced_at
  BEFORE UPDATE ON routine_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_synced_at();

CREATE TRIGGER update_step_tracker_sessions_synced_at
  BEFORE UPDATE ON step_tracker_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_synced_at();

-- ============================================================
-- Verification Queries (run after migration)
-- ============================================================
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM exercise_sessions LIMIT 1;
-- SELECT * FROM routine_sessions LIMIT 1;
-- SELECT * FROM step_tracker_sessions LIMIT 1;
-- SELECT * FROM routine_analyses LIMIT 1;
