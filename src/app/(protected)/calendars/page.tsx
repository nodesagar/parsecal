"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ConnectedCalendar } from "@/types";
import { Calendar, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function CalendarsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <CalendarsContent />
    </Suspense>
  );
}

function CalendarsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [calendars, setCalendars] = useState<ConnectedCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashSuccessMsg, setFlashSuccessMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserEmail(user.email || null);

    const { data: calData } = await supabase
      .from("connected_calendars")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    setCalendars(calData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  async function disconnectCalendar(id: string) {
    if (!confirm("Are you sure you want to disconnect this calendar?")) return;

    await supabase
      .from("connected_calendars")
      .update({ is_active: false })
      .eq("id", id);

    setCalendars(calendars.filter((c) => c.id !== id));
    setFlashSuccessMsg("Calendar disconnected successfully.");
    setTimeout(() => setFlashSuccessMsg(null), 3000);
  }

  function handleConnectGoogle() {
    window.location.href = "/api/auth/calendar/google/init?next=/calendars";
  }

  function handleConnectOutlook() {
    window.location.href = "/api/auth/calendar/outlook/init?next=/calendars";
  }

  const googleConnected = calendars.find((c) => c.provider === "google");
  const outlookConnected = calendars.find((c) => c.provider === "outlook");
  const errorMsg = searchParams.get("error");
  const successMsg = flashSuccessMsg || searchParams.get("success");
  const isGenericOutlookLabel =
    outlookConnected?.calendar_name === "Calendar" ||
    outlookConnected?.calendar_name === "Outlook Calendar";
  const outlookDisplayName =
    outlookConnected && isGenericOutlookLabel && userEmail
      ? userEmail
      : outlookConnected?.calendar_name;

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-bg border border-border hover:border-primary cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">Calendar Connections</h1>
          <p className="text-sm text-text-muted">
            Connect or disconnect calendars for one-click event push.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-error/10 text-error px-4 py-3 rounded-[10px] mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-success/10 text-success px-4 py-3 rounded-[10px] mb-6 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-[16px] p-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-bg rounded-[10px] border border-border">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${googleConnected ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">Google Calendar</p>
              <p className="text-xs text-text-muted">
                {googleConnected ? googleConnected.calendar_name : "Not connected"}
              </p>
            </div>
          </div>
          {googleConnected ? (
            <button
              onClick={() => disconnectCalendar(googleConnected.id)}
              className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-[8px] cursor-pointer transition-colors"
              title="Disconnect Calendar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConnectGoogle}
              className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-[10px] cursor-pointer hover:bg-primary-dark"
            >
              Connect
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-bg rounded-[10px] border border-border">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${outlookConnected ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">Microsoft Outlook</p>
              <p className="text-xs text-text-muted">
                {outlookConnected ? outlookDisplayName : "Not connected"}
              </p>
            </div>
          </div>
          {outlookConnected ? (
            <button
              onClick={() => disconnectCalendar(outlookConnected.id)}
              className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-[8px] cursor-pointer transition-colors"
              title="Disconnect Calendar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConnectOutlook}
              className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-[10px] cursor-pointer hover:bg-primary-dark"
            >
              Connect
            </button>
          )}
        </div>

        <p className="text-xs text-text-muted text-center pt-1">
          You can still export .ics files without connecting any calendar.
        </p>
      </div>
    </div>
  );
}
