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
  CheckCircle2,
  Globe,
  Settings,
} from "lucide-react";

type Tab = "dashboard" | "parses" | "connected";

const MOCK_EVENTS = [
  { id: "1", title: "Product Sync", start: "2026-04-13T10:00:00", provider: "google" as "google" | "outlook", location: "Meeting Room A" },
  { id: "2", title: "Design Review", start: "2026-04-14T14:30:00", provider: "google" as "google" | "outlook", location: "Zoom" },
  { id: "3", title: "Weekly Planning", start: "2026-04-15T09:00:00", provider: "google" as "google" | "outlook", location: "Main Office" },
  { id: "4", title: "Client Call", start: "2026-04-16T16:00:00", provider: "google" as "google" | "outlook", location: "Phone" },
  { id: "5", title: "Team Lunch", start: "2026-04-17T12:00:00", provider: "google" as "google" | "outlook", location: "The Bistro" },
];

const MOCK_SESSIONS = [
  {
    id: "s1",
    title: "University Timetable Q2",
    input_type: "pdf",
    status: "pushed",
    event_count: 12,
    date: "Apr 12",
  },
  {
    id: "s2",
    title: "4pm coffee on 20th april",
    input_type: "text",
    status: "draft",
    event_count: 1,
    date: "Apr 10",
  },
  {
    id: "s3",
    title: "Project Sync Transcript",
    input_type: "text",
    status: "failed",
    event_count: 0,
    date: "Apr 08",
  },
  {
    id: "s4",
    title: "Flight Itinerary",
    input_type: "pdf",
    status: "pushed",
    event_count: 3,
    date: "Apr 05",
  },
];

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [provider, setProvider] = useState<"google" | "outlook">("google");
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
    if (filter === "all") return MOCK_SESSIONS.slice(0, 2);
    return MOCK_SESSIONS.filter(s => s.status === "draft");
  }, [filter]);

  const providerEvents = useMemo(() => {
    if (provider === "google") return MOCK_EVENTS;
    return MOCK_EVENTS.map(e => ({ ...e, title: `[Outlook] ${e.title}`, provider: "outlook" as const }));
  }, [provider]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 text-left relative min-h-[520px]">
      {/* Sidebar Mock */}
      <div className="hidden lg:flex w-64 flex-col gap-6 p-6 bg-bg-card border border-border rounded-[24px]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-text">ParseCal</span>
        </div>
        
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-primary/5 text-primary' : 'text-text-muted hover:bg-bg hover:text-text'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'dashboard' ? 'bg-primary' : 'bg-transparent'}`} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("parses")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === 'parses' ? 'bg-primary/5 text-primary' : 'text-text-muted hover:bg-bg hover:text-text'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'parses' ? 'bg-primary' : 'bg-transparent'}`} />
            Parses
          </button>
          <button 
            onClick={() => setActiveTab("connected")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === 'connected' ? 'bg-primary/5 text-primary' : 'text-text-muted hover:bg-bg hover:text-text'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'connected' ? 'bg-primary' : 'bg-transparent'}`} />
            Connected
          </button>
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
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
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
                      Viewing {provider === 'google' ? 'Google' : 'Outlook'} Calendar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Provider Toggle */}
                  <div className="flex items-center gap-1 bg-border/20 p-1 rounded-xl">
                    <button 
                      onClick={() => setProvider("google")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${provider === 'google' ? 'bg-white shadow-md border border-border text-[#4285F4]' : 'text-text-muted hover:text-text'}`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                    <button 
                      onClick={() => setProvider("outlook")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${provider === 'outlook' ? 'bg-white shadow-md border border-border text-[#0078d4]' : 'text-text-muted hover:text-text'}`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="60 90.4 570.02 539.67" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="outlook-linear0" gradientUnits="userSpaceOnUse" x1="9.98908" y1="22.3649" x2="30.9322" y2="9.37495" gradientTransform="matrix(15,0,0,15,0,0)">
                            <stop offset="0" stopColor="#20A7FA"/><stop offset="0.4" stopColor="#3BD5FF"/><stop offset="1" stopColor="#C4B0FF"/>
                          </linearGradient>
                          <linearGradient id="outlook-linear1" gradientUnits="userSpaceOnUse" x1="17.1972" y1="26.7945" x2="28.8562" y2="8.12575" gradientTransform="matrix(15,0,0,15,0,0)">
                            <stop offset="0" stopColor="#165AD9"/><stop offset="0.5" stopColor="#1880E5"/><stop offset="1" stopColor="#8587FF"/>
                          </linearGradient>
                          <linearGradient id="outlook-linear3" gradientUnits="userSpaceOnUse" x1="24.0534" y1="31.1099" x2="44.51" y2="18.0177" gradientTransform="matrix(15,0,0,15,0,0)">
                            <stop offset="0" stopColor="#1A43A6"/><stop offset="0.49" stopColor="#2052CB"/><stop offset="1" stopColor="#5F20CB"/>
                          </linearGradient>
                          <linearGradient id="outlook-linear5" gradientUnits="userSpaceOnUse" x1="41.998" y1="29.9431" x2="23.8517" y2="29.9431" gradientTransform="matrix(15,0,0,15,0,0)">
                            <stop offset="0" stopColor="#4DC4FF"/><stop offset="0.2" stopColor="#0FAF9FF"/>
                          </linearGradient>
                          <radialGradient id="outlook-radial4" gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="1" gradientTransform="matrix(215.767,230.769,-230.769,215.767,59.144,354.231)">
                            <stop offset="0.04" stopColor="#0091FF"/><stop offset="0.92" stopColor="#183DAD"/>
                          </radialGradient>
                        </defs>
                        <path fill="url(#outlook-linear0)" d="M463.98 140.14L119.64 358.41L90.02 311.7L90.02 271.44C90.02 256.78 97.45 243.12 109.74 235.14L309.91 105.26C340.41 85.47 379.69 85.46 410.19 105.25L463.98 140.14Z"/>
                        <path fill="url(#outlook-linear1)" d="M407.1 103.34C408.14 103.95 409.16 104.59 410.18 105.25L566.4 206.59L179.06 452.11L119.63 358.34L403.89 177.8C430.82 160.7 432 122.23 407.1 103.34Z"/>
                        <path fill="url(#outlook-linear3)" d="M333.6 498.99L179.07 452.11L507.63 243.84C535.3 226.3 535.23 185.9 507.5 168.46L506.02 167.53L510.28 170.18L610.27 235.04C622.57 243.02 630 256.68 630 271.34L630 310.3L333.6 498.99Z"/>
                        <path fill="url(#outlook-linear5)" d="M315.77 630.05L536.22 630.05C588 630.05 630 588.08 630 536.3L630 272.14C630 287.44 622.11 301.67 609.15 309.8L281.24 515.7C263.55 526.8 252.82 546.22 252.82 567.11C252.82 601.87 281 630.05 315.77 630.05Z"/>
                        <path fill="url(#outlook-radial4)" d="M108.75 345L251.25 345C278.18 345 300 366.82 300 393.75L300 536.25C300 563.18 278.18 585 251.25 585L108.75 585C81.82 585 60 563.18 60 536.25L60 393.75C60 366.82 81.82 345 108.75 345Z"/>
                        <path fill="white" d="M179.39 534C159.54 534 143.25 527.79 130.51 515.38C117.77 502.96 111.4 486.76 111.4 466.77C111.4 445.66 117.87 428.59 130.8 415.55C143.73 402.52 160.66 396 181.59 396C201.38 396 217.47 402.24 229.89 414.71C242.38 427.19 248.62 443.64 248.62 464.07C248.62 485.05 242.15 501.96 229.22 514.82C216.35 527.61 199.74 534 179.39 534ZM179.96 507.65C190.78 507.65 199.48 503.95 206.08 496.57C212.67 489.18 215.97 478.9 215.97 465.74C215.97 452.02 212.77 441.35 206.37 433.71C199.96 426.07 191.42 422.26 180.73 422.26C169.72 422.26 160.85 426.2 154.13 434.08C147.41 441.91 144.05 452.27 144.05 465.18C144.05 478.29 147.41 488.65 154.13 496.29C160.85 503.86 169.46 507.65 179.96 507.65Z"/>
                      </svg>
                      Outlook
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-border/20 p-1 rounded-xl">
                    <button onClick={prevMonth} className="p-1.5 border border-border bg-white rounded-[8px] shadow-sm hover:bg-bg transition-colors active:scale-95"><ChevronLeft className="w-3 h-3" /></button>
                    <button onClick={goToday} className="p-1 px-3 border border-border bg-white rounded-[8px] text-[10px] font-bold shadow-sm hover:bg-bg transition-colors active:scale-95 uppercase tracking-tighter">Today</button>
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
                  const isToday = day === 6 && month === 3;

                  return (
                    <div key={i} className={`h-[80px] border-b border-r border-border/20 p-1 relative transition-all duration-300 hover:bg-primary/[0.02] ${isCurrentMonth ? '' : 'bg-bg/20 opacity-40'} ${isToday ? 'bg-primary/[0.04]' : ''}`}>
                      {isCurrentMonth && (
                        <span className={`text-[10px] font-bold inline-flex items-center justify-center w-5 h-5 rounded-full transition-all ${isToday ? 'bg-primary text-white shadow-md scale-110' : 'text-text-muted'}`}>
                          {day}
                        </span>
                      )}
                      {hasEvents && (
                        <div className="mt-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-300">
                          <button 
                            onClick={() => setSelectedEvent(providerEvents.find(e => new Date(e.start).getDate() === day) || null)}
                            className={`w-full text-left text-[8px] font-bold px-1.5 py-1 rounded-md truncate border transition-all active:scale-95 ${provider === 'google' ? 'bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/10 hover:bg-[#4285F4]/20' : 'bg-[#0078d4]/10 text-[#0078d4] border-[#0078d4]/10 hover:bg-[#0078d4]/20'}`}
                          >
                            {providerEvents.find(e => new Date(e.start).getDate() === day)?.title}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedEvent && (
                <div className="absolute bottom-4 left-4 right-4 bg-bg-card border border-primary/20 rounded-2xl p-4 shadow-xl animate-in slide-in-from-bottom-4 transition-all z-20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${provider === 'google' ? 'bg-[#4285F4]' : 'bg-[#0078d4]'}`} />
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
                      <span className={`font-bold ${provider === 'google' ? 'text-[#4285F4]' : 'text-[#0078d4]'}`}>@</span>
                      {selectedEvent.location}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Parses Mock Overlay */}
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSessions.map((s) => (
                  <div key={s.id} className="group bg-bg-card border border-border hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all rounded-[18px] p-4 flex items-center gap-4 cursor-pointer">
                    <div className="w-11 h-11 bg-bg rounded-xl flex items-center justify-center border border-border group-hover:bg-primary/5 transition-colors">
                      {s.input_type === 'pdf' ? <FileText className="w-5 h-5 text-text-muted" /> : <Type className="w-5 h-5 text-text-muted" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-text truncate group-hover:text-primary transition-colors">{s.title}</span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-widest ${s.status === 'pushed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-light group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "parses" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Dossier: All Parses</h3>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-text-light" />
                <div className="w-32 bg-bg border border-border rounded-lg h-8" />
              </div>
            </div>
            
            <div className="bg-bg-card border border-border rounded-[24px] overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg/40 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold text-text-muted text-[10px] uppercase tracking-wider">Session</th>
                    <th className="px-6 py-4 font-bold text-text-muted text-[10px] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold text-text-muted text-[10px] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 font-bold text-text-muted text-[10px] uppercase tracking-wider">Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {MOCK_SESSIONS.map((s) => (
                    <tr key={s.id} className="hover:bg-bg/20 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           {s.input_type === 'pdf' ? <FileText className="w-4 h-4 text-text-muted" /> : <Type className="w-4 h-4 text-text-muted" />}
                           <span className="font-semibold group-hover:text-primary transition-colors">{s.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${s.status === 'pushed' ? 'bg-success/10 text-success' : s.status === 'failed' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-muted text-xs font-medium">{s.date}</td>
                      <td className="px-6 py-4 text-text-muted text-xs font-bold">{s.event_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "connected" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-lg font-bold text-text">Calendar Nodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-card border border-primary/20 rounded-[24px] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-full text-[10px] font-bold">
                     <CheckCircle2 className="w-3 h-3" />
                     ACTIVE
                   </div>
                </div>
                <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <h4 className="font-bold text-text mb-1">Google Calendar</h4>
                <p className="text-xs text-text-muted mb-4">sagar@example.com</p>
                <button className="text-[11px] font-bold text-error border border-error/20 px-4 py-2 rounded-xl hover:bg-error/5 transition-colors">Disconnect</button>
              </div>

              <div className="bg-bg-card border border-border border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center text-center opacity-60">
                 <div className="w-12 h-12 bg-bg rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" viewBox="60 90.4 570.02 539.67" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="outlook-linear0-large" gradientUnits="userSpaceOnUse" x1="9.98908" y1="22.3649" x2="30.9322" y2="9.37495" gradientTransform="matrix(15,0,0,15,0,0)">
                          <stop offset="0" stopColor="#20A7FA"/><stop offset="0.4" stopColor="#3BD5FF"/><stop offset="1" stopColor="#C4B0FF"/>
                        </linearGradient>
                        <linearGradient id="outlook-linear1-large" gradientUnits="userSpaceOnUse" x1="17.1972" y1="26.7945" x2="28.8562" y2="8.12575" gradientTransform="matrix(15,0,0,15,0,0)">
                          <stop offset="0" stopColor="#165AD9"/><stop offset="0.5" stopColor="#1880E5"/><stop offset="1" stopColor="#8587FF"/>
                        </linearGradient>
                        <linearGradient id="outlook-linear3-large" gradientUnits="userSpaceOnUse" x1="24.0534" y1="31.1099" x2="44.51" y2="18.0177" gradientTransform="matrix(15,0,0,15,0,0)">
                          <stop offset="0" stopColor="#1A43A6"/><stop offset="0.49" stopColor="#2052CB"/><stop offset="1" stopColor="#5F20CB"/>
                        </linearGradient>
                        <linearGradient id="outlook-linear5-large" gradientUnits="userSpaceOnUse" x1="41.998" y1="29.9431" x2="23.8517" y2="29.9431" gradientTransform="matrix(15,0,0,15,0,0)">
                          <stop offset="0" stopColor="#4DC4FF"/><stop offset="0.2" stopColor="#0FAF9FF"/>
                        </linearGradient>
                        <radialGradient id="outlook-radial4-large" gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="1" gradientTransform="matrix(215.767,230.769,-230.769,215.767,59.144,354.231)">
                          <stop offset="0.04" stopColor="#0091FF"/><stop offset="0.92" stopColor="#183DAD"/>
                        </radialGradient>
                      </defs>
                      <path fill="url(#outlook-linear0-large)" d="M463.98 140.14L119.64 358.41L90.02 311.7L90.02 271.44C90.02 256.78 97.45 243.12 109.74 235.14L309.91 105.26C340.41 85.47 379.69 85.46 410.19 105.25L463.98 140.14Z"/>
                      <path fill="url(#outlook-linear1-large)" d="M407.1 103.34C408.14 103.95 409.16 104.59 410.18 105.25L566.4 206.59L179.06 452.11L119.63 358.34L403.89 177.8C430.82 160.7 432 122.23 407.1 103.34Z"/>
                      <path fill="url(#outlook-linear3-large)" d="M333.6 498.99L179.07 452.11L507.63 243.84C535.3 226.3 535.23 185.9 507.5 168.46L506.02 167.53L510.28 170.18L610.27 235.04C622.57 243.02 630 256.68 630 271.34L630 310.3L333.6 498.99Z"/>
                      <path fill="url(#outlook-linear5-large)" d="M315.77 630.05L536.22 630.05C588 630.05 630 588.08 630 536.3L630 272.14C630 287.44 622.11 301.67 609.15 309.8L281.24 515.7C263.55 526.8 252.82 546.22 252.82 567.11C252.82 601.87 281 630.05 315.77 630.05Z"/>
                      <path fill="url(#outlook-radial4-large)" d="M108.75 345L251.25 345C278.18 345 300 366.82 300 393.75L300 536.25C300 563.18 278.18 585 251.25 585L108.75 585C81.82 585 60 563.18 60 536.25L60 393.75C60 366.82 81.82 345 108.75 345Z"/>
                      <path fill="white" d="M179.39 534C159.54 534 143.25 527.79 130.51 515.38C117.77 502.96 111.4 486.76 111.4 466.77C111.4 445.66 117.87 428.59 130.8 415.55C143.73 402.52 160.66 396 181.59 396C201.38 396 217.47 402.24 229.89 414.71C242.38 427.19 248.62 443.64 248.62 464.07C248.62 485.05 242.15 501.96 229.22 514.82C216.35 527.61 199.74 534 179.39 534ZM179.96 507.65C190.78 507.65 199.48 503.95 206.08 496.57C212.67 489.18 215.97 478.9 215.97 465.74C215.97 452.02 212.77 441.35 206.37 433.71C199.96 426.07 191.42 422.26 180.73 422.26C169.72 422.26 160.85 426.2 154.13 434.08C147.41 441.91 144.05 452.27 144.05 465.18C144.05 478.29 147.41 488.65 154.13 496.29C160.85 503.86 169.46 507.65 179.96 507.65Z"/>
                    </svg>
                 </div>
                 <h4 className="font-bold text-text mb-1">Outlook Calendar</h4>
                 <p className="text-xs text-text-muted mb-4">Connect your Microsoft account</p>
                 <button className="text-[11px] font-bold bg-bg border border-border px-4 py-2 rounded-xl hover:bg-bg-card transition-all">Link Calendar</button>
              </div>
            </div>
            
            <div className="p-6 bg-bg border border-border rounded-[24px]">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cta/10 rounded-xl flex items-center justify-center text-cta">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-sm">Global Push Sync</h4>
                    <p className="text-[10px] text-text-muted">Automatically sync changes back to original files</p>
                  </div>
               </div>
               <div className="flex items-center justify-between text-xs font-semibold px-2">
                 <span>Auto-Push New Parses</span>
                 <div className="w-10 h-5 bg-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                 </div>
               </div>
            </div>
          </div>
        )}
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
