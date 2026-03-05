-- ============================================
-- CalendarAI Initial Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- profiles: extends auth.users
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  default_timezone TEXT NOT NULL DEFAULT 'UTC',
  preferred_calendar_provider TEXT NOT NULL DEFAULT 'manual'
    CHECK (preferred_calendar_provider IN ('google', 'outlook', 'manual')),
  preferred_ai_provider TEXT NOT NULL DEFAULT 'gemini'
    CHECK (preferred_ai_provider IN ('gemini', 'openai', 'claude')),
  custom_ai_api_key TEXT,
  monthly_parse_count INT NOT NULL DEFAULT 0
    CHECK (monthly_parse_count >= 0),
  monthly_parse_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + INTERVAL '1 month',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_own ON profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- connected_calendars
-- ============================================
CREATE TABLE connected_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL DEFAULT 'Primary',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, calendar_id)
);

CREATE INDEX idx_connected_calendars_user_id ON connected_calendars(user_id);
CREATE INDEX idx_connected_calendars_active ON connected_calendars(user_id, provider)
  WHERE is_active = TRUE;

ALTER TABLE connected_calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY calendars_own ON connected_calendars
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- parse_sessions
-- ============================================
CREATE TABLE parse_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL CHECK (input_type IN ('pdf', 'image', 'text')),
  input_file_path TEXT,
  raw_text_input TEXT,
  ai_provider_used TEXT NOT NULL
    CHECK (ai_provider_used IN ('gemini', 'openai', 'claude')),
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'draft', 'pushed', 'partially_pushed', 'failed')),
  event_count INT NOT NULL DEFAULT 0 CHECK (event_count >= 0),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (input_file_path IS NOT NULL OR raw_text_input IS NOT NULL)
);

CREATE INDEX idx_parse_sessions_user_id ON parse_sessions(user_id);
CREATE INDEX idx_parse_sessions_user_status ON parse_sessions(user_id, status);
CREATE INDEX idx_parse_sessions_created ON parse_sessions(created_at);

ALTER TABLE parse_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_own ON parse_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- parsed_events
-- ============================================
CREATE TABLE parsed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES parse_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  location TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_rule TEXT,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 1.00
    CHECK (confidence >= 0 AND confidence <= 1),
  is_ambiguous BOOLEAN NOT NULL DEFAULT FALSE,
  ambiguity_note TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT TRUE,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  pushed_to_provider TEXT,
  external_event_id TEXT,
  pushed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parsed_events_session ON parsed_events(session_id);
CREATE INDEX idx_parsed_events_selected ON parsed_events(session_id)
  WHERE is_selected = TRUE;

ALTER TABLE parsed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_own ON parsed_events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parse_sessions
      WHERE parse_sessions.id = parsed_events.session_id
      AND parse_sessions.user_id = auth.uid()
    )
  );
