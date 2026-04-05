"use client";

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Type,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";

const MOCK_EVENTS = [
  { id: "1", title: "Product Sync", start: "2026-04-13T10:00:00", provider: "google" as const },
  { id: "2", title: "Design Review", start: "2026-04-14T14:30:00", provider: "google" as const },
  { id: "3", title: "Weekly Planning", start: "2026-04-15T09:00:00", provider: "google" as const },
  { id: "4", title: "Client Call", start: "2026-04-16T16:00:00", provider: "google" as const },
  { id: "5", title: "Team Lunch", start: "2026-04-17T12:00:00", provider: "google" as const },
];

const MOCK_SESSIONS = [
  {
    id: "s1",
    title: "University Timetable Q2",
    input_type: "pdf",
    status: "pushed",
    event_count: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: "s2",
    title: "4pm coffee on 20th april",
    input_type: "text",
    status: "draft",
    event_count: 1,
    created_at: new Date().toISOString(),
  },
];

export default function DashboardPreview() {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 text-left">
      {/* Sidebar (Mock) */}
      <div className="hidden lg:flex w-64 flex-col gap-6 p-6 bg-bg-card border border-border rounded-[24px]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-text">ParseCal</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 text-primary rounded-xl font-semibold text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Dashboard
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-text-muted hover:bg-bg rounded-xl text-sm font-medium transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            Parses
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-text-muted hover:bg-bg rounded-xl text-sm font-medium transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            Connected
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Calendar View Mock */}
        <div className="bg-bg-card border border-border rounded-[24px] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-[12px] flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text">April 2026</h3>
                <p className="text-[10px] text-primary font-bold flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Viewing Google Calendar
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-border/20 p-1 rounded-xl">
                 <button className="p-1 px-2 border border-border bg-white rounded-[8px] text-[10px] font-bold shadow-sm">Today</button>
                 <button className="p-1.5 border border-border bg-white rounded-[8px] shadow-sm"><ChevronLeft className="w-3 h-3" /></button>
                 <button className="p-1.5 border border-border bg-white rounded-[8px] shadow-sm"><ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-border bg-bg/30">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 text-center text-[9px] font-bold uppercase tracking-wider text-text-muted border-r border-border/20 last:border-0">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i - 2; // Offset for April 2026
              const isCurrentMonth = day > 0 && day <= 30;
              const hasEvents = isCurrentMonth && [13, 14, 15, 16, 17].includes(day);
              const isToday = day === 6; // Mock "today"

              return (
                <div key={i} className={`h-[80px] border-b border-r border-border/20 p-1 relative transition-colors hover:bg-bg/50 ${isToday ? 'bg-primary/[0.03]' : ''}`}>
                  {isCurrentMonth && (
                    <span className={`text-[10px] font-bold inline-flex items-center justify-center w-5 h-5 rounded-full ${isToday ? 'bg-primary text-white' : 'text-text-muted'}`}>
                      {day}
                    </span>
                  )}
                  {hasEvents && (
                    <div className="mt-1 space-y-0.5">
                      <div className="bg-primary/10 text-primary text-[8px] font-bold px-1 py-0.5 rounded truncate border border-primary/10">
                        {MOCK_EVENTS.find(e => new Date(e.start).getDate() === day)?.title}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Parses Mock */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              Recent Parses
            </h3>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 bg-bg border border-border p-0.5 rounded-lg">
                 <button className="px-2 py-1 bg-white shadow-sm border border-border rounded-md text-[10px] font-bold text-primary">All</button>
                 <button className="px-2 py-1 text-[10px] font-medium text-text-muted hover:text-text">Draft</button>
               </div>
               <div className="relative">
                 <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-text-light" />
                 <div className="w-32 bg-bg border border-border rounded-lg h-7" />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOCK_SESSIONS.map((s) => (
              <div key={s.id} className="bg-bg-card border border-border hover:border-primary/50 transition-colors rounded-[16px] p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-bg rounded-xl flex items-center justify-center border border-border">
                  {s.input_type === 'pdf' ? <FileText className="w-4 h-4 text-text-muted" /> : <Type className="w-4 h-4 text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text truncate">{s.title}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${s.status === 'pushed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">{s.event_count} events extracted</p>
                </div>
                <ArrowRight className="w-3 h-3 text-text-light" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
