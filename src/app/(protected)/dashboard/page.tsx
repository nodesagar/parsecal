export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Upload, Plus, Clock, Calendar } from "lucide-react";
import SessionList from "@/components/dashboard/session-list";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: sessions } = await supabase
    .from("parse_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: connectedCalendars } = await supabase
    .from("connected_calendars")
    .select("provider")
    .eq("user_id", user?.id)
    .eq("is_active", true);

  const parseLimit = parseInt(process.env.MONTHLY_PARSE_LIMIT || "20");
  const parsesUsed = profile?.monthly_parse_count ?? 0;
  const parsesRemaining = Math.max(0, parseLimit - parsesUsed);
  const hasConnectedCalendar = (connectedCalendars?.length || 0) > 0;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">
          Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-text-muted text-sm">
          Upload a file or paste text to extract calendar events.
        </p>
      </div>

      {/* Upload Zone */}
      {!hasConnectedCalendar && (
        <div className="bg-primary/5 border border-primary/20 rounded-[16px] p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-text mb-1">
                Recommended first step: connect your calendar
              </h2>
              <p className="text-xs text-text-muted mb-3">
                This lets users push events directly instead of only downloading
                .ics files.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/api/auth/calendar/google/init?next=/dashboard"
                  className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-medium text-sm px-4 py-2 rounded-[10px] cursor-pointer"
                >
                  Connect Google
                </Link>
                <Link
                  href="/api/auth/calendar/outlook/init?next=/dashboard"
                  className="inline-flex items-center justify-center bg-bg border border-border hover:border-primary text-text font-medium text-sm px-4 py-2 rounded-[10px] cursor-pointer"
                >
                  Connect Outlook
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/parse/new"
        className="block bg-bg-card border-2 border-dashed border-border hover:border-primary rounded-[16px] p-10 text-center mb-8 group cursor-pointer"
      >
        <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-text mb-1">
          Upload or paste schedule data
        </h2>
        <p className="text-sm text-text-muted mb-4">
          PDF, images (including handwritten notes), or plain text
        </p>
        <span className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold px-6 py-2.5 rounded-[10px] text-sm">
          <Plus className="w-4 h-4" />
          New Parse
        </span>
      </Link>

      {/* Usage Meter */}
      <div className="bg-bg-card border border-border rounded-[16px] p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text">Monthly Parses</span>
          <span className="text-sm text-text-muted">
            {parsesUsed}/{parseLimit} used
          </span>
        </div>
        <div className="w-full bg-bg rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              parsesRemaining <= 3 ? "bg-error" : "bg-primary"
            }`}
            style={{
              width: `${Math.min(100, (parsesUsed / parseLimit) * 100)}%`,
            }}
          />
        </div>
        {parsesRemaining <= 3 && (
          <p className="text-xs text-warning mt-2">
            {parsesRemaining === 0
              ? "Limit reached — add your own AI key in Settings for unlimited use."
              : `Only ${parsesRemaining} parses remaining this month.`}
          </p>
        )}
      </div>

      {/* Recent Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-muted" />
          Recent Parses
        </h2>

        {!sessions || sessions.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-[16px] p-8 text-center">
            <p className="text-text-muted text-sm">
              No parses yet. Upload your first schedule to get started!
            </p>
          </div>
        ) : (
          <SessionList sessions={sessions} />
        )}
      </div>
    </div>
  );
}
