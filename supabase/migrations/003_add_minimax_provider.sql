-- ============================================
-- Migration: Add Minimax to AI Providers
-- ============================================

-- Drop existing constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_preferred_ai_provider_check;
ALTER TABLE parse_sessions DROP CONSTRAINT IF EXISTS parse_sessions_ai_provider_used_check;

-- Add updated constraints to include 'minimax'
ALTER TABLE profiles
  ADD CONSTRAINT profiles_preferred_ai_provider_check
  CHECK (preferred_ai_provider IN ('gemini', 'openai', 'claude', 'minimax'));

ALTER TABLE parse_sessions
  ADD CONSTRAINT parse_sessions_ai_provider_used_check
  CHECK (ai_provider_used IN ('gemini', 'openai', 'claude', 'minimax'));
