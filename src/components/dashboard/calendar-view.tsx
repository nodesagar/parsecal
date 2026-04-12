"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";

type Provider = "google" | "outlook";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
  location?: string;
  provider: Provider;
}

interface ConnectedCalendar {
  provider: Provider;
  account_email?: string;
}

interface CalendarViewProps {
  connectedCalendars: ConnectedCalendar[];
}

const PROVIDER_META: Record<Provider, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  google: {
    label: "Google",
    color: "text-[#1a73e8]",
    bg: "bg-[#1a73e8]/10",
    border: "border-[#1a73e8]/20",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  outlook: {
    label: "Outlook",
    color: "text-[#0072C6]",
    bg: "bg-[#0072C6]/10",
    border: "border-[#0072C6]/20",
    icon: (
      <img src="/icons/outlook.svg" alt="Outlook" className="w-4 h-4" />
    ),
  },
};

export default function CalendarView({ connectedCalendars }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default provider to first connected calendar
  useEffect(() => {
    if (connectedCalendars.length > 0 && !activeProvider) {
      setActiveProvider(connectedCalendars[0].provider);
    }
  }, [connectedCalendars, activeProvider]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthParam = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const fetchEvents = useCallback(async () => {
    if (!activeProvider) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar/events?provider=${activeProvider}&month=${monthParam}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load events");
        setEvents([]);
      } else {
        setEvents(data.events || []);
      }
    } catch {
      setError("Network error fetching events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [activeProvider, monthParam]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const today = new Date();

  // Group events by day
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  events.forEach((event) => {
    const eventDate = new Date(event.start);
    if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
      const day = eventDate.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    }
  });

  const providerMeta = activeProvider ? PROVIDER_META[activeProvider] : null;

  // No calendars connected
  if (connectedCalendars.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-[24px] p-12 text-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-text mb-2">No Calendars Connected</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Connect your Google or Outlook calendar to see your events here and push parsed schedules directly.
        </p>
      </div>
    );
  }

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-[88px] border-b border-r border-border/30" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const dayEvents = eventsByDay[d] || [];

    days.push(
      <div
        key={d}
        className={`h-[88px] border-b border-r border-border/30 p-1.5 transition-colors hover:bg-bg/40 relative ${isToday ? "bg-primary/[0.04]" : ""}`}
      >
        <span
          className={`text-[11px] font-semibold inline-flex items-center justify-center ${
            isToday
              ? "bg-primary text-white w-6 h-6 rounded-full"
              : "text-text-muted w-6 h-6"
          }`}
        >
          {d}
        </span>
        <div className="mt-0.5 space-y-0.5 overflow-hidden max-h-[48px]">
          {dayEvents.slice(0, 2).map((event) => {
            const time = event.isAllDay
              ? ""
              : new Date(event.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            return (
              <div
                key={event.id}
                className={`text-[10px] px-1.5 py-0.5 rounded-[4px] truncate font-medium ${
                  event.provider === "google"
                    ? "bg-[#1a73e8]/10 text-[#1a73e8] border border-[#1a73e8]/10"
                    : "bg-[#0072C6]/10 text-[#0072C6] border border-[#0072C6]/10"
                }`}
                title={`${event.title}${time ? ` at ${time}` : ""}${event.location ? ` — ${event.location}` : ""}`}
              >
                {time ? `${time} ` : ""}
                {event.title}
              </div>
            );
          })}
          {dayEvents.length > 2 && (
            <span className="text-[9px] text-text-muted font-medium pl-1">
              +{dayEvents.length - 2} more
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-[12px] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">{monthName} {year}</h2>
            {providerMeta && (
              <p className={`text-xs ${providerMeta.color} font-medium flex items-center gap-1.5`}>
                {providerMeta.icon}
                Viewing {providerMeta.label} Calendar
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Provider Switcher */}
          {connectedCalendars.length > 1 && (
            <div className="flex items-center bg-bg border border-border rounded-[10px] p-0.5">
              {connectedCalendars.map((cal) => {
                const meta = PROVIDER_META[cal.provider];
                const isActive = activeProvider === cal.provider;
                return (
                  <button
                    key={cal.provider}
                    onClick={() => setActiveProvider(cal.provider)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                      isActive
                        ? `bg-white shadow-sm ${meta.color} border ${meta.border}`
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    {meta.icon}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Single provider badge */}
          {connectedCalendars.length === 1 && providerMeta && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold ${providerMeta.bg} ${providerMeta.color} border ${providerMeta.border}`}>
              {providerMeta.icon}
              {providerMeta.label}
            </div>
          )}

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-2 rounded-[8px] border border-border hover:bg-bg transition-colors">
              <ChevronLeft className="w-4 h-4 text-text-muted" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-border rounded-[8px] hover:bg-bg transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 rounded-[8px] border border-border hover:bg-bg transition-colors">
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-3 bg-bg/30 border-b border-border text-xs text-text-muted">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Fetching events...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center gap-2 py-3 bg-error/5 border-b border-error/10 text-xs text-error">
          {error}
          {(error.toLowerCase().includes('reconnect') || error.toLowerCase().includes('revoked') || error.toLowerCase().includes('expired')) ? (
            <a
              href={`/api/auth/calendar/${activeProvider}/init?next=%2Fdashboard`}
              className="underline font-semibold ml-1"
            >
              Reconnect
            </a>
          ) : (
            <button onClick={fetchEvents} className="underline font-semibold ml-1">
              Retry
            </button>
          )}
        </div>
      )}

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-border bg-bg/20">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-muted border-r border-border/30 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">{days}</div>
    </div>
  );
}
