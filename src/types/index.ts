import { z } from "zod";

// ============================================
// AI Parsed Event Schema
// ============================================

export const ParsedEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().default(null),
  start_datetime: z.string(), // ISO 8601
  end_datetime: z.string().nullable().default(null),
  is_all_day: z.boolean().default(false),
  location: z.string().nullable().default(null),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.string().nullable().default(null),
  confidence: z.number().min(0).max(1).default(1),
  is_ambiguous: z.boolean().default(false),
  ambiguity_note: z.string().nullable().default(null),
});

export const ParseResponseSchema = z.object({
  events: z.array(ParsedEventSchema),
});

export type ParsedEventFromAI = z.infer<typeof ParsedEventSchema>;

// ============================================
// Database Types
// ============================================

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  default_timezone: string;
  preferred_calendar_provider: "google" | "outlook" | "manual";
  preferred_ai_provider: "gemini" | "openai" | "claude";
  custom_ai_api_key: string | null;
  monthly_parse_count: number;
  monthly_parse_reset_at: string;
  time_format: "12h" | "24h";
  default_event_duration: number;
  default_reminder: number;
  created_at: string;
  updated_at: string;
};

export type ConnectedCalendar = {
  id: string;
  user_id: string;
  provider: "google" | "outlook";
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  calendar_id: string;
  calendar_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ParseSession = {
  id: string;
  user_id: string;
  title: string | null;
  input_type: "pdf" | "image" | "text";
  input_file_path: string | null;
  raw_text_input: string | null;
  ai_provider_used: "gemini" | "openai" | "claude";
  status: "processing" | "draft" | "pushed" | "partially_pushed" | "failed";
  event_count: number;
  error_message: string | null;
  created_at: string;
};

export type ParsedEvent = {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  is_all_day: boolean;
  location: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  confidence: number;
  is_ambiguous: boolean;
  ambiguity_note: string | null;
  is_selected: boolean;
  is_edited: boolean;
  pushed_to_provider: string | null;
  external_event_id: string | null;
  pushed_at: string | null;
  created_at: string;
};

// ============================================
// AI Provider Types
// ============================================

export type AIProviderName = "gemini" | "openai" | "claude";

export type ParseInput = {
  type: "pdf" | "image" | "text";
  content: string; // base64 for files, raw for text
  mimeType?: string;
  timezone: string;
};

// ============================================
// Calendar Types
// ============================================

export type CalendarProvider = "google" | "outlook";

export type CalendarEvent = {
  title: string;
  description: string | null;
  start: string; // ISO 8601
  end: string | null;
  isAllDay: boolean;
  location: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
};

export type PushResult = {
  eventId: string;
  externalId: string | null;
  success: boolean;
  error?: string;
};

export type PushSummary = {
  pushed: number;
  failed: number;
  results: PushResult[];
};
