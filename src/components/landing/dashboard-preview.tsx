"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Type,
  ArrowRight,
  Search,
  Filter,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

const MOCK_EVENTS = [
  { id: "1", title: "Product Sync", start: "2026-04-13T10:00:00", provider: "google" as const, location: "Meeting Room A" },
  { id: "2", title: "Design Review", start: "2026-04-14T14:30:00", provider: "google" as const, location: "Zoom" },
  { id: "3", title: "Weekly Planning", start: "2026-04-15T09:00:00", provider: "google" as const, location: "Main Office" },
  { id: "4", title: "Client Call", start: "2026-04-16T16:00:00", provider: "google" as const, location: "Phone" },
  { id: "5", title: "Team Lunch", start: "2026-04-17T12:00:00", provider: "google" as const, location: "The Bistro" },
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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [filter, setFilter] = useState<"all" | "draft">("all");
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);
  const [isNewParseOpen, setIsNewParseOpen] = useState(false);

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date(2026, 3, 6));

  const filteredSessions = useMemo(() => {
    if (filter === "all") return MOCK_SESSIONS;
    return MOCK_SESSIONS.filter(s => s.status === "draft");
  }, [filter]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 text-left relative">
      {/* Sidebar (Mock) */}
      <div className="hidden lg:flex w-64 flex-col gap-6 p-6 bg-bg-card border border-border rounded-[24px]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-text">ParseCal</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 text-primary rounded-xl font-semibold text-sm cursor-pointer">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Dashboard
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-text-muted hover:bg-bg rounded-xl text-sm font-medium transition-colors cursor-pointer">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            Parses
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-text-muted hover:bg-bg rounded-xl text-sm font-medium transition-colors cursor-pointer">
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
            Connected
          </div>
        </div>

        <button 
          onClick={() => setIsNewParseOpen(true)}
          className="mt-auto flex items-center justify-center gap-2 bg-cta hover:bg-cta-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Parse
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Calendar View Mock */}
        <div className="bg-bg-card border border-border rounded-[24px] overflow-hidden shadow-sm relative">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-[12px] flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text transition-all">{monthName} {year}</h3>
                <p className="text-[10px] text-primary font-bold flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Viewing Google Calendar
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-border/20 p-1 rounded-xl">
                 <button onClick={goToday} className="p-1 px-3 border border-border bg-white rounded-[8px] text-[10px] font-bold shadow-sm hover:bg-bg transition-colors active:scale-95">Today</button>
                 <button onClick={prevMonth} className="p-1.5 border border-border bg-white rounded-[8px] shadow-sm hover:bg-bg transition-colors active:scale-95"><ChevronLeft className="w-3 h-3" /></button>
                 <button onClick={nextMonth} className="p-1.5 border border-border bg-white rounded-[8px] shadow-sm hover:bg-bg transition-colors active:scale-95"><ChevronRight className="w-3 h-3" /></button>
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
              const startDayOffset = new Date(year, month, 1).getDay();
              const day = i - startDayOffset + 1;
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const isCurrentMonth = day > 0 && day <= daysInMonth;
              const hasEvents = isCurrentMonth && month === 3 && [13, 14, 15, 16, 17].includes(day);
              const isToday = day === 6 && month === 3; // Mock "today" as April 6

              return (
                <div key={i} className={`h-[80px] border-b border-r border-border/20 p-1 relative transition-all duration-300 hover:bg-primary/[0.02] ${isCurrentMonth ? '' : 'bg-bg/20 opacity-40'} ${isToday ? 'bg-primary/[0.04]' : ''}`}>
                  {isCurrentMonth && (
                    <span className={`text-[10px] font-bold inline-flex items-center justify-center w-5 h-5 rounded-full transition-all ${isToday ? 'bg-primary text-white shadow-md scale-110' : 'text-text-muted'}`}>
                      {day}
                    </span>
                  )}
                  {hasEvents && (
                    <div className="mt-1 space-y-0.5">
                      <button 
                        onClick={() => setSelectedEvent(MOCK_EVENTS.find(e => new Date(e.start).getDate() === day) || null)}
                        className="w-full text-left bg-primary/10 text-primary text-[8px] font-bold px-1.5 py-1 rounded-md truncate border border-primary/10 hover:bg-primary/20 transition-all active:scale-95"
                      >
                        {MOCK_EVENTS.find(e => new Date(e.start).getDate() === day)?.title}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Event Details Toast/Modal Simulation */}
          {selectedEvent && (
            <div className="absolute bottom-4 left-4 right-4 bg-bg-card border border-primary/20 rounded-2xl p-4 shadow-xl animate-in slide-in-from-bottom-4 transition-all z-20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h4 className="text-sm font-bold text-text">{selectedEvent.title}</h4>
                </div>
                <button onClick={() => setSelectedEvent(null)}>
                  <X className="w-4 h-4 text-text-muted hover:text-text" />
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5 italic">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-primary">@</span>
                  {selectedEvent.location}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Parses Mock */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              Recent Parses
            </h3>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 bg-bg border border-border p-0.5 rounded-xl shadow-inner">
                 <button 
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${filter === "all" ? 'bg-white shadow-sm border border-border text-primary' : 'text-text-muted hover:text-text'}`}
                 >
                   All
                 </button>
                 <button 
                  onClick={() => setFilter("draft")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${filter === "draft" ? 'bg-white shadow-sm border border-border text-warning' : 'text-text-muted hover:text-text'}`}
                 >
                   Draft
                 </button>
               </div>
               <div className="relative group">
                 <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
                 <input 
                  disabled
                  placeholder="Search..."
                  className="w-32 bg-bg border border-border rounded-xl h-8 pl-8 text-[10px] focus:outline-none focus:border-primary transition-all cursor-not-allowed" 
                 />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 transition-all duration-500">
            {filteredSessions.map((s) => (
              <div key={s.id} className="group bg-bg-card border border-border hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all rounded-[18px] p-4 flex items-center gap-4 cursor-pointer">
                <div className="w-11 h-11 bg-bg rounded-xl flex items-center justify-center border border-border group-hover:bg-primary/5 transition-colors">
                  {s.input_type === 'pdf' ? <FileText className="w-5 h-5 text-text-muted" /> : <Type className="w-5 h-5 text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">{s.title}</span>
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-widest ${s.status === 'pushed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold tracking-tight">{s.event_count} events extracted</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-light transform group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mock "New Parse" Modal */}
      {isNewParseOpen && (
        <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-bg-card border border-border rounded-[28px] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsNewParseOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-bg rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Initialize AI Parser</h3>
            <p className="text-sm text-text-muted text-center mb-8">Drop your PDF, screenshot, or text here to start extracting events instantly.</p>
            
            <div className="space-y-3">
              <div className="h-12 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-xs text-text-light font-medium">
                Upload File (PDF/PNG)
              </div>
              <button 
                onClick={() => setIsNewParseOpen(false)}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl transition-all hover:bg-primary-dark active:scale-95"
              >
                Scan Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
