"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_CALENDAR_INTEGRATION_ENABLED } from "@/lib/features";
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
  const [autoSync, setAutoSync] = useState(true); // UI placeholder

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

    const activeCalendars = calData || [];
    setCalendars(
      GOOGLE_CALENDAR_INTEGRATION_ENABLED
        ? activeCalendars
        : activeCalendars.filter((calendar) => calendar.provider !== "google"),
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
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
  
  const isGenericOutlookLabel =
    outlookConnected?.calendar_name === "Calendar" ||
    outlookConnected?.calendar_name === "Outlook Calendar";
  const outlookDisplayName =
    outlookConnected && isGenericOutlookLabel && userEmail
      ? userEmail
      : outlookConnected?.calendar_name;

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="skeleton h-48 w-full rounded-[24px]" />
          <div className="skeleton h-48 w-full rounded-[24px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Connected Calendars</h1>
      </div>

      {flashSuccessMsg && (
        <div className="bg-success/10 text-success px-4 py-3 rounded-[12px] text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4" />
          {flashSuccessMsg}
        </div>
      )}

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Calendar Card */}
        <div className={`relative bg-bg-card border rounded-[28px] p-8 transition-all shadow-xs ${googleConnected ? 'border-primary/20 bg-primary/[0.01]' : 'border-border/60 border-dashed'}`}>
          {googleConnected && (
            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               <CheckCircle2 className="w-3.5 h-3.5 text-success" />
               <span className="text-[10px] font-bold text-success uppercase tracking-wider">Active</span>
            </div>
          )}
          
          <div className="flex flex-col h-full">
            <div className="w-14 h-14 bg-bg rounded-[18px] border border-border/40 flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-text mb-1">Google Calendar</h3>
            <p className="text-sm text-text-muted mb-8">
              {googleConnected ? googleConnected.calendar_name : "Quickly sync your events to Google"}
            </p>

            <div className="mt-auto">
              {googleConnected ? (
                <button
                  onClick={() => disconnectCalendar(googleConnected.id)}
                  className="px-6 py-2.5 rounded-[12px] border border-error/20 hover:bg-error/5 text-error text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="px-6 py-3 rounded-[12px] bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Link Calendar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Outlook Calendar Card */}
        <div className={`relative bg-bg-card border rounded-[28px] p-8 transition-all shadow-xs ${outlookConnected ? 'border-primary/20 bg-primary/[0.01]' : 'border-border/60 border-dashed'}`}>
          {outlookConnected && (
            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               <CheckCircle2 className="w-3.5 h-3.5 text-success" />
               <span className="text-[10px] font-bold text-success uppercase tracking-wider">Active</span>
            </div>
          )}

          <div className="flex flex-col h-full text-center md:text-left md:items-start items-center">
            <div className="w-14 h-14 bg-bg rounded-[18px] border border-border/40 flex items-center justify-center mb-6 shadow-sm">
              <img src="/icons/outlook.svg" alt="Outlook" className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-text mb-1">Outlook Calendar</h3>
            <p className="text-sm text-text-muted mb-8">
              {outlookConnected ? outlookDisplayName : "Connect your Microsoft account"}
            </p>

            <div className="mt-auto w-full flex justify-center md:justify-start">
              {outlookConnected ? (
                <button
                  onClick={() => disconnectCalendar(outlookConnected.id)}
                  className="px-6 py-2.5 rounded-[12px] border border-error/20 hover:bg-error/5 text-error text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnectOutlook}
                  className="px-8 py-3 rounded-[12px] bg-bg-card border border-border hover:border-primary/30 text-text text-sm font-bold shadow-xs hover:bg-bg transition-all active:scale-[0.98] cursor-pointer"
                >
                  Link Calendar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Automatic Sync Section */}
      <div className="bg-bg-card border border-border/60 rounded-[28px] p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-[14px] flex items-center justify-center shrink-0">
               <div className="p-2 bg-bg-card rounded-[10px] shadow-xs">
                  <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
               </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text mb-1">Automatic Sync</h3>
              <p className="text-sm text-text-muted">Instantly save new events to your calendar</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-2">
            <span className="text-sm font-bold text-text">Auto-Add New Events</span>
            <button 
              onClick={() => setAutoSync(!autoSync)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoSync ? 'bg-primary' : 'bg-border/60'}`}
            >
              <span 
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${autoSync ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
